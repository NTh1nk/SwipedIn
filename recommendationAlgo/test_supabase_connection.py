import os
from supabase import create_client, Client

# Initialize Supabase client
supabase_url = os.getenv('SUPABASE_URL', 'http://127.0.0.1:54321')
supabase_key = os.getenv('SUPABASE_ANON_KEY', 'your-anon-key')
supabase: Client = create_client(supabase_url, supabase_key)

def test_connection():
    """
    Test the Supabase connection and check the Job_duplicate table
    """
    try:
        print("Testing Supabase connection...")
        
        # Try to query the Job_duplicate table
        response = supabase.table('Job_duplicate').select('*').limit(5).execute()
        
        if response.data:
            print(f"✅ Successfully connected to Supabase!")
            print(f"📊 Found {len(response.data)} jobs in Job_duplicate table")
            print("\nSample job data:")
            for i, job in enumerate(response.data[:3]):
                print(f"\nJob {i+1}:")
                for key, value in job.items():
                    print(f"  {key}: {value}")
        else:
            print("✅ Connected to Supabase, but Job_duplicate table is empty")
            
    except Exception as e:
        print(f"❌ Error connecting to Supabase: {e}")
        print("\nMake sure to set your environment variables:")
        print("export SUPABASE_URL='your-supabase-url'")
        print("export SUPABASE_ANON_KEY='your-anon-key'")

if __name__ == "__main__":
    test_connection() 