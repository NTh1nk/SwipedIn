"use client";

import { useEffect, useRef, useState } from "react";
import {
	useMotionValue,
	useTransform,
	useAnimation,
	useMotionValueEvent,
} from "framer-motion";
import { StatusBar } from "./components/StatusBar";
import { CardStack } from "./components/CardStack";
import { ChoiceOptions } from "./components/ChoiceOptions";
import { loadGameScenarios, ensureDefaultOptions, loadMoreScenarios } from "@/lib/supabase/cardUtils";
import { createClient } from '@supabase/supabase-js';
import { getJobs } from "@/lib/supabase/jobUtils";

// Define the type inline to avoid conflicts
type ClientScenario = {
	situation: string;
	job_title: string;
	company_name: string;
	location: string;
	salary?: string;
	company_rating?: number;
	apply_link?: string;
	optionA: { text: string; id: number };
	optionB: { text: string; id: number };
};

const DRAG_THRESHOLD = 200;
const THROW_VELOCITY = 750;


/*
const clientScenario = (
	situation: string,
	optionRows: { leading_choice: string | null; id: number }[]
) => ({
	situation,
	optionA: { text: optionRows[0].leading_choice, id: optionRows[0].id },
	optionB: { text: optionRows[1].leading_choice, id: optionRows[1].id },
});
*/

const STARTING_SCENARIO_ID = 5;

const supabase = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL!,
	process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Import for keyword extraction and matching
const ALLOWED_KEYWORDS = [
  'python', 'javascript', 'react', 'node', 'java', 'c++', 'c#', 'php', 'ruby', 'go', 'rust',
  'html', 'css', 'sql', 'mongodb', 'postgresql', 'mysql', 'redis', 'docker', 'kubernetes',
  'aws', 'azure', 'gcp', 'cloud', 'devops', 'ci/cd', 'git', 'github', 'agile', 'scrum',
  'developer', 'engineer', 'programmer', 'coder', 'architect', 'analyst', 'scientist',
  'manager', 'lead', 'senior', 'junior', 'full stack', 'frontend', 'backend', 'mobile',
  'web', 'software', 'hardware', 'system', 'network', 'security', 'database', 'data',
  'machine learning', 'ai', 'artificial intelligence', 'nlp', 'computer vision', 'deep learning',
  'designer', 'ui', 'ux', 'user interface', 'user experience', 'product', 'project',
  'business', 'marketing', 'sales', 'customer', 'support', 'operations', 'finance',
  'hr', 'human resources', 'legal', 'medical', 'healthcare', 'education', 'research',
  'experience', 'years', 'team', 'collaboration', 'communication', 'leadership',
  'problem solving', 'analysis', 'planning', 'organization', 'management',
  'remote', 'onsite', 'hybrid', 'full time', 'part time', 'contract', 'freelance',
  'degree', 'bachelor', 'master', 'phd', 'certification', 'certified', 'training',
  'course', 'workshop', 'seminar', 'conference', 'meetup'
];

// Fix: add types to parameters and return type
async function extractKeywordsWithLLM(resume: string, allowedKeywords: string[]): Promise<string | null> {
  const allowedKeywordsStr = allowedKeywords.join(', ');
  const prompt = `Extract the most relevant keywords from this resume, separated by commas. Only output the keywords, nothing else. You must only use keywords from the following list:\n${allowedKeywordsStr}\n\nResume:\n${resume}`;
  const response = await fetch('https://ai.hackclub.com/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [ { role: 'user', content: prompt } ],
      stream: false
    }),
  });
  if (!response.ok) return null;
  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) return null;
  return content.replace(/\n/g, '').replace(/^Keywords: */i, '').trim();
}

function createJobDescriptions(jobs: any[]): string[] {
  const descriptions = [];
  for (const job of jobs) {
    const title = job.job_title || job.title || job.position || 'Unknown Position';
    const company = job.company_name || job.company || 'Unknown Company';
    const location = job.location || job.job_location || 'Unknown Location';
    const description = job.description || job.description_text || job.job_description || '';
    const descriptionText = `${title} at ${company} in ${location}. ${description}`;
    descriptions.push(descriptionText);
  }
  return descriptions;
}

function simpleKeywordMatching(resumeText: string, jobs: any[], topK: number = 50) {
  const resumeLower = resumeText.toLowerCase();
  const jobDescriptions = createJobDescriptions(jobs);
  const keywords = ALLOWED_KEYWORDS;
  const scores = [];
  for (let i = 0; i < jobs.length; i++) {
    const jobDesc = jobDescriptions[i];
    const jobLower = jobDesc.toLowerCase();
    let score = 0;
    const matchedKeywords = [];
    for (const keyword of keywords) {
      if (resumeLower.includes(keyword) && jobLower.includes(keyword)) {
        score += 1;
        matchedKeywords.push(keyword);
      }
    }
    // Bonus for environmental jobs
    if (['garbage', 'collector', 'waste', 'recycling'].some(word => resumeLower.includes(word))) {
      if (['environmental', 'waste', 'recycling', 'sustainability', 'operations', 'maintenance'].some(word => jobLower.includes(word))) {
        score += 2;
      }
    }
    // Bonus for general work experience terms
    const generalTerms = ['experience', 'work', 'job', 'position', 'role', 'responsibility'];
    for (const term of generalTerms) {
      if (resumeLower.includes(term) && jobLower.includes(term)) {
        score += 0.5;
      }
    }
    scores.push({ score, index: i, matchedKeywords });
  }
  scores.sort((a, b) => b.score - a.score);
  const recommendations = [];
  for (let rank = 0; rank < Math.min(topK, scores.length); rank++) {
    const { score, index, matchedKeywords } = scores[rank];
    const job = jobs[index];
    const normalizedScore = Math.min(score / 10, 1.0);
    recommendations.push({ job, similarity_score: normalizedScore, rank: rank + 1, matched_keywords: matchedKeywords });
  }
  return recommendations;
}

export default function GameInterface() {
	const [dayCount, setDayCount] = useState(0);
	const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
	const [isAnimating, setIsAnimating] = useState(false);
	const [stats] = useState({
		nature: 50,
		social: 50,
		military: 50,
		economy: 50,
	});
	// const [scenarios] = useState<Database["public"]["Tables"]["games"]["Row"][]>(
	// 	[]
	// );
	const [scenarios, setScenarios] = useState<number[]>([]);
	const [scenariosData, setScenariosData] = useState<ClientScenario[]>([]);
	const [isLoadingMore, setIsLoadingMore] = useState(false);
	
	const [currentScenario, setCurrentScenario] = useState<ClientScenario | null>(
		null
	);
	const [isLoading, setIsLoading] = useState(true);
	const choiseScenarios = useRef<{
		optionA: ClientScenario | null;
		optionB: ClientScenario | null;
	}>({
		optionA: null,
		optionB: null,
	});

	// Load more scenarios when needed
	const loadMoreScenariosIfNeeded = async () => {
		// If we're within 2 cards of the end, load more
		if (currentScenarioIndex >= scenariosData.length - 2 && !isLoadingMore) {
			setIsLoadingMore(true);
			try {
				const newScenarios = await loadMoreScenarios(scenariosData.length);
				if (newScenarios.length > 0) {
					setScenariosData(prev => [...prev, ...newScenarios]);
					setScenarios(prev => [...prev, ...newScenarios.map((_: any, index: number) => prev.length + index)]);
				}
			} catch (error) {
				console.error("Failed to load more scenarios:", error);
			} finally {
				setIsLoadingMore(false);
			}
		}
	};

	useEffect(() => {
		async function loadAndMatchJobs() {
    // Try to get resume from localStorage (same as algo page)
    let resume = localStorage.getItem('resumeText') || localStorage.getItem('resumeData');
    if (resume && resume.length > 10) {
      // Extract keywords from resume
      const keywords = await extractKeywordsWithLLM(resume, ALLOWED_KEYWORDS);
      if (keywords) {
        // Fetch 100 jobs from Supabase to find the best matches
        const { data: allJobs, error } = await supabase
          .from('jobs')
          .select('*')
          .order('jobid', { ascending: true })
          .limit(100);
        
        if (error) {
          console.error('Error fetching jobs:', error);
          // Fallback to random jobs
          loadGameScenarios()
            .then((scenarios) => {
              setScenariosData(scenarios);
              setScenarios(scenarios.map((_: any, index: number) => index));
              setCurrentScenario(scenarios[0] || null);
              setIsLoading(false);
            })
            .catch((error) => {
              const fallbackScenario = ensureDefaultOptions({
                situation: "Unable to load jobs. Please try again later.",
                job_title: "Error",
                company_name: "System",
                location: "N/A",
                salary: undefined,
                optionA: { text: "Decline", id: 0 },
                optionB: { text: "Apply", id: 0 }
              });
              setCurrentScenario(fallbackScenario);
              setScenariosData([fallbackScenario]);
              setScenarios([0]);
              setIsLoading(false);
            });
          return;
        }
        
        console.log(`Loaded ${allJobs?.length || 0} jobs from database`);
        
        // Use keyword matching to find the best 10 jobs from the 100
        const recommendations = simpleKeywordMatching(keywords, allJobs || [], 10);
        console.log(`Selected top ${recommendations.length} jobs by match score`);
        
        // Convert only the top 10 to scenarios
        const scenarios = recommendations.map((rec, idx) => ensureDefaultOptions({
          situation: `${rec.job.job_title || rec.job.title} at ${rec.job.company_name || rec.job.company} (${rec.job.location || rec.job.job_location})`,
          job_title: rec.job.job_title || rec.job.title,
          company_name: rec.job.company_name || rec.job.company,
          location: rec.job.location || rec.job.job_location,
          salary: rec.job.salary_formatted,
          company_rating: rec.job.company_rating,
          apply_link: rec.job.apply_link,
          optionA: { text: 'Decline', id: rec.job.jobid || rec.job.id || idx },
          optionB: { text: 'Apply', id: rec.job.jobid || rec.job.id || idx },
        }));
        setScenariosData(scenarios);
        setScenarios(scenarios.map((_, index) => index));
        setCurrentScenario(scenarios[0] || null);
        setIsLoading(false);
        return;
      }
    }
    // Fallback: load random jobs as before
    loadGameScenarios()
      .then((scenarios) => {
        setScenariosData(scenarios);
        setScenarios(scenarios.map((_: any, index: number) => index));
        setCurrentScenario(scenarios[0] || null);
        setIsLoading(false);
      })
      .catch((error) => {
        const fallbackScenario = ensureDefaultOptions({
          situation: "Unable to load jobs. Please try again later.",
          job_title: "Error",
          company_name: "System",
          location: "N/A",
          salary: undefined,
          optionA: { text: "Decline", id: 0 },
          optionB: { text: "Apply", id: 0 }
        });
        setCurrentScenario(fallbackScenario);
        setScenariosData([fallbackScenario]);
        setScenarios([0]);
        setIsLoading(false);
      });
  }
  loadAndMatchJobs();
  // eslint-disable-next-line
}, []);

	// Check if we need to load more scenarios when currentScenarioIndex changes
	useEffect(() => {
		loadMoreScenariosIfNeeded();
	}, [currentScenarioIndex, scenariosData.length]);

	useEffect(() => {
		console.log(choiseScenarios);
	}, [choiseScenarios]);

	const mainControls = useAnimation();
	const SecondControls = useAnimation();

	// Card motion values
	const x = useMotionValue(0);
	const y = useMotionValue(0);
	const rotate = useTransform(
		[x, y],
		([latestX, latestY]) => Number(latestX) * 0.05 + Number(latestY) * 0.05
	);

	const leftOpacity = useTransform(x, [200, 30, -30, -200], [0, 0.7, 0.7, 1]);
	const rightOpacity = useTransform(x, [-200, -30, 30, 200], [0, 0.7, 0.7, 1]);

	const [nextCardContent, setNextCardContent] = useState<string>("");

	useMotionValueEvent(x, "change", (latestX) => {
		// console.log(latestX);

		if (latestX < 0) {
			setNextCardContent(choiseScenarios.current.optionA?.situation || "");
		} else {
			setNextCardContent(choiseScenarios.current.optionB?.situation || "");
		}
	});
	
	// Add keyboard navigation with useEffect
	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "ArrowLeft") {
				event.preventDefault();
				if (currentScenarioIndex > 0) {
					mainControls.start({
						x: -200,
					});
					setNextCardContent(choiseScenarios.current.optionA?.situation || "");
					setCurrentScenarioIndex(prev => prev + 1);
					mainControls.start({
						x: 0,
					});
				}
			}
			if (event.key === "ArrowRight") {
				event.preventDefault();
				if (currentScenarioIndex < scenariosData.length - 1) {
					mainControls.start({
						x: 200,
					});
					setNextCardContent(choiseScenarios.current.optionB?.situation || "");
					setCurrentScenarioIndex(prev => prev + 1);
					mainControls.start({
						x: 0,
					});
				}
			}
			setDayCount((prev) => prev + 1); //day count increment

		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [mainControls, currentScenarioIndex, scenariosData.length]);


	// const opacity = useTransform(x, [-200, 0, 200], [0, 1, 0]);

	// Add a useEffect to update currentScenario when currentScenarioIndex changes
	useEffect(() => {
		if (scenariosData.length > 0 && currentScenarioIndex < scenariosData.length) {
			const scenario = ensureDefaultOptions(scenariosData[currentScenarioIndex]);
			setCurrentScenario(scenario);
			// Update choice scenarios for the current job
			choiseScenarios.current = {
				optionA: scenario,
				optionB: scenario,
			};
			
			// Log the match score for the current card
			const resume = localStorage.getItem('resumeText') || localStorage.getItem('resumeData');
			console.log('Resume data found:', resume ? 'Yes' : 'No');
			console.log('Resume length:', resume?.length || 0);
			if (resume && resume.length > 10) {
				console.log('Resume preview:', resume.substring(0, 100) + '...');
				
				// Calculate match score for current job using the same logic as simpleKeywordMatching
				const resumeLower = resume.toLowerCase();
				const jobDesc = `${scenario.job_title} at ${scenario.company_name} in ${scenario.location}. ${scenario.situation}`;
				const jobLower = jobDesc.toLowerCase();
				
				console.log('Job description:', jobDesc);
				
				let score = 0;
				const matchedKeywords = [];
				
				// Check for exact keyword matches
				for (const keyword of ALLOWED_KEYWORDS) {
					if (resumeLower.includes(keyword) && jobLower.includes(keyword)) {
						score += 1;
						matchedKeywords.push(keyword);
					}
				}
				
				// Check for partial matches and basic terms
				const basicTerms = ['coding', 'code', 'programming', 'program', 'develop', 'development', 'math', 'mathematics', 'good', 'skill', 'skills'];
				for (const term of basicTerms) {
					if (resumeLower.includes(term) && jobLower.includes(term)) {
						score += 0.5;
						matchedKeywords.push(term);
					}
				}
				
				// Check for partial matches in job titles/descriptions
				if (resumeLower.includes('coding') || resumeLower.includes('code')) {
					if (jobLower.includes('engineer') || jobLower.includes('developer') || jobLower.includes('programmer')) {
						score += 1;
						matchedKeywords.push('coding->engineering');
					}
				}
				
				if (resumeLower.includes('math')) {
					if (jobLower.includes('analyst') || jobLower.includes('scientist') || jobLower.includes('data')) {
						score += 1;
						matchedKeywords.push('math->analysis');
					}
				}
				
				// Bonus for environmental jobs
				if (['garbage', 'collector', 'waste', 'recycling'].some(word => resumeLower.includes(word))) {
					if (['environmental', 'waste', 'recycling', 'sustainability', 'operations', 'maintenance'].some(word => jobLower.includes(word))) {
						score += 2;
					}
				}
				
				// Bonus for general work experience terms
				const generalTerms = ['experience', 'work', 'job', 'position', 'role', 'responsibility'];
				for (const term of generalTerms) {
					if (resumeLower.includes(term) && jobLower.includes(term)) {
						score += 0.5;
					}
				}
				
				const normalizedScore = Math.min(score / 10, 1.0);
				console.log(`Current card match score: ${(normalizedScore * 100).toFixed(1)}% - ${scenario.job_title} at ${scenario.company_name}`);
				console.log(`Raw score: ${score}`);
				if (matchedKeywords.length > 0) {
					console.log(`Matched keywords: ${matchedKeywords.join(', ')}`);
				} else {
					console.log('No keywords matched');
				}
			} else {
				console.log('No resume data found in localStorage. Please upload a resume in the profile page first.');
			}
		}
	}, [currentScenarioIndex, scenariosData]);

	const handleDragEnd = async (
		event: MouseEvent | TouchEvent | PointerEvent,
		info: {
			offset: { x: number; y: number };
			velocity: { x: number; y: number };
		}
	) => {
		console.log("offset: ", info.offset.x);
		console.log("velocity: ", info.velocity.x);
		const predictedX = info.offset.x + info.velocity.x;
		const predictedY = info.offset.y + info.velocity.y;

		const offset = Math.sqrt(predictedX ** 2 + (predictedY / 10) ** 2);

		console.log("offset: ", offset);
		const velocity = Math.sqrt(
			info.velocity.x ** 2 + (info.velocity.y / 2) ** 2
		);
		console.log("fetchNextScenario");

		if (offset > 300 && velocity > 40 && !isAnimating) {
			setIsAnimating(true);
			const angle = Math.atan2(predictedY, predictedX);
			const throwX = Math.cos(angle) * window.innerWidth * 1.5;
			const throwY = Math.sin(angle) * window.innerHeight * 1.5;

			await mainControls.start({
				x: throwX,
				y: throwY,
				opacity: 0,
				transition: { duration: 1 },
			});

			const isSwipingLeft = predictedX < 0;
			const isSwipingRight = !isSwipingLeft;
			const selectedScenario = isSwipingLeft
				? choiseScenarios.current.optionA
				: choiseScenarios.current.optionB;

			if (selectedScenario) {
				setCurrentScenario(selectedScenario);
			}
			setDayCount((prev) => prev + 1); //day count increment

			// Move to next scenario
			setCurrentScenarioIndex((prevIndex) => prevIndex + 1);
			x.set(0);
			y.set(0);

			// Reset card position for next scenario
			setIsAnimating(false);

			if (isSwipingRight && selectedScenario) {
				const appliedJobs = JSON.parse(localStorage.getItem("appliedJobs") || "[]");
				if (!appliedJobs.some((j: any) => j.optionA.id === selectedScenario.optionA.id && j.situation === selectedScenario.situation)) {
					appliedJobs.push(selectedScenario);
					localStorage.setItem("appliedJobs", JSON.stringify(appliedJobs));
				}
			}
		} else {
			// Snap back to center
			mainControls.start({
				x: 0,
				y: 0,
				transition: { type: "spring", stiffness: 300, damping: 20 },
			});
		}
	};

	const getRandomRotation = () => (Math.random() - 0.5) * 5;

	// useEffect(() => {
	// 	mainControls.set({ x: 0, y: 0, opacity: 1 });
	// }, [currentScenario]);

	if (isLoading) {
		return <div className="min-h-screen bg-blue-100 text-black text-center flex flex-col overflow-hidden">Loading...</div>;
	}

	if (!currentScenario) {
		return <div>Error loading scenario</div>;
	}

	return (
		<div className="min-h-screen bg-blue-100 text-black flex flex-col overflow-hidden">
			<div className="mt-8 text-center font-mono">
				<p className="text-2xl">SwipedIn</p>
			</div>
			<div className="mt-8 text-center">
          <a
            href="/apply"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            View Jobs
          </a>
        </div>
			<div className="flex-1 flex flex-col p-4 max-w-md mx-auto w-full text-black">
				<CardStack
					scenarios={scenarios}
					currentScenarioIndex={currentScenarioIndex}
					isAnimating={isAnimating}
					currentScenario={currentScenario}
					nextCardContent={nextCardContent}
					scenariosData={scenariosData}
					cardControls={{
						rotate,
						x,
						y,
						mainControls,
						handleDragEnd,
					}}
				/>

				<ChoiceOptions
					currentScenario={currentScenario}
					leftOpacity={leftOpacity}
					rightOpacity={rightOpacity}
				/>

				<div className="mt-8 text-center font-mono">
					
					<p className="text-neutral-400">{dayCount} jobs looked through</p>
				</div>
			</div>
		</div>
	);
}
