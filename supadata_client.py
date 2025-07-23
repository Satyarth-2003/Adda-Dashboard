import requests
import json
import os
from typing import Dict, Optional, List, Any

class SupaDataClient:
    BASE_URL = "https://api.supadata.ai/v1"
    
    def __init__(self, session_id: str):
        """
        Initialize the SupaData client with a session ID.
        """
        self.session = requests.Session()
        self.session_id = session_id
        self.session.cookies.set("sd_session", session_id)
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            "Content-Type": "application/json",
            "Accept": "application/json",
        }
    
    def _make_request(self, method: str, endpoint: str, **kwargs) -> Dict:
        """
        Make an authenticated request to the SupaData API.
        """
        url = f"{self.BASE_URL}/{endpoint.lstrip('/')}"
        response = self.session.request(
            method=method,
            url=url,
            headers={**self.headers, **kwargs.pop('headers', {})},
            **kwargs
        )
        
        try:
            response.raise_for_status()
            return response.json()
        except requests.exceptions.JSONDecodeError:
            return {"status": "error", "message": "Invalid JSON response", "raw_response": response.text}
        except requests.exceptions.RequestException as e:
            return {"status": "error", "message": str(e)}
    
    def get_organization_info(self) -> Dict:
        """
        Get information about the current organization.
        """
        return self._make_request("GET", "/organizations/current")
    
    def list_projects(self) -> Dict:
        """
        List all projects in the organization.
        """
        return self._make_request("GET", "/projects")
    
    def create_transcript(self, audio_url: str, language: str = "hi", 
                         name: str = None, **kwargs) -> Dict:
        """
        Create a new transcript from an audio URL.
        
        Args:
            audio_url: URL of the audio/video file to transcribe
            language: Language code (default: 'hi' for Hindi)
            name: Optional name for the transcript
            **kwargs: Additional parameters for the API
            
        Returns:
            Dict containing the transcript creation response
        """
        data = {
            "audio_url": audio_url,
            "language": language,
            "name": name or f"Transcript_{audio_url[-15:]}",
            **kwargs
        }
        return self._make_request("POST", "/transcripts", json=data)
    
    def get_transcript(self, transcript_id: str) -> Dict:
        """
        Get a transcript by ID.
        """
        return self._make_request("GET", f"/transcripts/{transcript_id}")
    
    def list_transcripts(self, limit: int = 10, offset: int = 0) -> Dict:
        """
        List all transcripts with pagination.
        """
        return self._make_request("GET", f"/transcripts?limit={limit}&offset={offset}")
    
    def delete_transcript(self, transcript_id: str) -> Dict:
        """
        Delete a transcript by ID.
        """
        return self._make_request("DELETE", f"/transcripts/{transcript_id}")

def test_supadata_client():
    # Initialize the client with your session ID
    SESSION_ID = "sd_34c7eee019290004202c004c0e4a9c24"
    client = SupaDataClient(SESSION_ID)
    
    try:
        # Test organization info
        print("Fetching organization info...")
        org_info = client.get_organization_info()
        print("Organization Info:", json.dumps(org_info, indent=2))
        
        # Test listing projects
        print("\nListing projects...")
        projects = client.list_projects()
        print("Projects:", json.dumps(projects, indent=2))
        
        # Example: Create a transcript (uncomment and modify as needed)
        # audio_url = "https://example.com/audio.mp3"
        # print(f"\nCreating transcript for {audio_url}...")
        # result = client.create_transcript(
        #     audio_url=audio_url,
        #     language="hi",
        #     name="Test Transcript"
        # )
        # print("Transcript creation result:", json.dumps(result, indent=2))
        # 
        # if result.get('id'):
        #     # Get the created transcript
        #     transcript_id = result['id']
        #     print(f"\nFetching transcript {transcript_id}...")
        #     transcript = client.get_transcript(transcript_id)
        #     print("Transcript:", json.dumps(transcript, indent=2))
        
    except Exception as e:
        print(f"Error: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_supadata_client()
