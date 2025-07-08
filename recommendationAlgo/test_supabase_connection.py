import os
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Initialize Supabase client
supabase_url = os.getenv('SUPABASE_URL', 'http://127.0.0.1:54321')
supabase_key = os.getenv('SUPABASE_ANON_KEY', 'your-anon-key')
supabase: Client = create_client(supabase_url, supabase_key)

def test_connection():
    """
    Test the Supabase connection and check for job tables
    """
    try:
        print("Testing Supabase connection...")
        print(f"URL: {supabase_url}")
        print(f"Key: {supabase_key[:20]}...")
        
        # Try different possible table names
        table_names = ['jobs', 'job_listings', 'job_posts', 'definitiondata']
        
        for table_name in table_names:
            try:
                print(f"\nTrying to query table: {table_name}")
                response = supabase.table(table_name).select('*').limit(3).execute()
                
                if response.data:
                    print(f"✅ Successfully connected to Supabase!")
                    print(f"📊 Found {len(response.data)} jobs in {table_name} table")
                    print("\nSample job data:")
                    for i, job in enumerate(response.data[:2]):
                        print(f"\nJob {i+1}:")
                        for key, value in job.items():
                            print(f"  {key}: {str(value)[:50]}...")
                    return
                else:
                    print(f"✅ Table {table_name} exists but is empty")
                    
            except Exception as e:
                print(f"❌ Table {table_name} not found: {e}")
                continue
        
        print("\n❌ No job tables found. Available tables might be:")
        print("- Check your Supabase dashboard for the correct table name")
        print("- Make sure you're connected to the right project")
            
    except Exception as e:
        print(f"❌ Error connecting to Supabase: {e}")
        print("\nTroubleshooting tips:")
        print("1. Make sure your local Supabase is running: cd swiped-in && supabase start")
        print("2. Check your .env file has the correct values")
        print("3. Verify you're connected to the right Supabase project")

if __name__ == "__main__":
    test_connection() 