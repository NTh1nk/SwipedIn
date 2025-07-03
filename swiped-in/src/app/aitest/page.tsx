"use client"

import { useState, useEffect } from "react";

export default function Page() {
	const [data, setData] = useState<{ situation: string; optionA: string; optionB: string } | null>(null);

	useEffect(() => {
		setData({
			situation: "A severe drought has crippled your nation's agriculture, causing widespread food shortages. International aid is available but requires the removal of key environmental regulations.",
			optionA: "Option A",
			optionB: "Option B",
		});
	}, []);

	return (
		<>
		{ data && (
			<div>
				<p>Situation: {data.situation}</p>
				<p>Choice A: {data.optionA}</p>
				<p>Choice B: {data.optionB}</p>
			</div>
			)}
			Hey
		</>
  );
};
