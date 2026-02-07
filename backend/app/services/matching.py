"""Lightweight keyword-based job matching (no ML dependencies)"""
from typing import List, Dict, Tuple
from app.models import UserProfile, Job


class KeywordMatcher:
    """Simple keyword-based job matching for lightweight deployment"""
    
    def __init__(self):
        print("Initializing KeywordMatcher (lightweight mode)...")
        print("Matcher ready!")
    
    def create_user_embedding(self, profile: UserProfile) -> List[str]:
        """Create a 'pseudo-embedding' (just a list of keywords from profile)"""
        keywords = set()
        
        # Add skills (lowercase for comparison)
        for skill in profile.skills:
            keywords.add(skill.lower().strip())
        
        # Add preferred roles
        for role in profile.preferred_roles:
            for word in role.lower().split():
                if len(word) > 2:  # Skip small words
                    keywords.add(word)
        
        # Add experience level
        keywords.add(profile.experience_level.lower())
        
        return list(keywords)
    
    def create_job_embedding(self, job: Job) -> List[str]:
        """Create a 'pseudo-embedding' (just a list of keywords from job)"""
        keywords = set()
        
        # Handle new Internshala-style fields
        title = job.JobTitles or job.title or ""
        company = job.Company_Name or job.company or ""
        skills_str = job.Skills or ""
        requirements = job.requirements or []
        
        # Add job title words
        for word in title.lower().split():
            if len(word) > 2:
                keywords.add(word)
        
        # Add skills from Skills field (comma separated)
        if skills_str:
            for skill in skills_str.split(','):
                keywords.add(skill.lower().strip())
        
        # Add requirements
        for req in requirements:
            keywords.add(req.lower().strip())
        
        return list(keywords)
    
    def calculate_similarity(self, user_keywords: List[str], job_keywords: List[str]) -> float:
        """Calculate Jaccard-like similarity between keyword sets"""
        if not user_keywords or not job_keywords:
            return 50.0  # Default score
        
        user_set = set(user_keywords)
        job_set = set(job_keywords)
        
        # Find intersection
        matches = user_set.intersection(job_set)
        
        # Use Jaccard-like formula but weighted towards matches
        if len(job_set) == 0:
            return 50.0
        
        # Score based on how many job requirements are matched
        match_ratio = len(matches) / len(job_set)
        
        # Convert to 0-100 scale with some baseline
        score = 40 + (match_ratio * 60)  # Range: 40-100
        
        return min(100.0, score)
    
    def rank_jobs(self, profile: UserProfile, jobs: List[Job], job_embeddings: Dict[str, List[str]] = None) -> List[Tuple[Job, float]]:
        """Rank jobs by keyword similarity to user profile"""
        user_keywords = self.create_user_embedding(profile)
        
        job_scores = []
        
        for job in jobs:
            job_id = job.job_id or job.Links or f"job_{id(job)}"
            
            if job_embeddings and job_id in job_embeddings:
                job_keywords = job_embeddings[job_id]
            else:
                job_keywords = self.create_job_embedding(job)
            
            score = self.calculate_similarity(user_keywords, job_keywords)
            job_scores.append((job, score))
        
        # Sort by score descending
        job_scores.sort(key=lambda x: x[1], reverse=True)
        return job_scores
    
    def find_similar_skills(self, skill: str, skill_pool: List[str], top_k: int = 3) -> List[str]:
        """Find similar skills using simple string matching"""
        skill_lower = skill.lower()
        
        # Simple matching: skills that contain the same words
        matches = []
        for pool_skill in skill_pool:
            pool_lower = pool_skill.lower()
            
            # Check for substring match or word overlap
            if skill_lower in pool_lower or pool_lower in skill_lower:
                matches.append((pool_skill, 0.8))
            else:
                # Word overlap
                skill_words = set(skill_lower.split())
                pool_words = set(pool_lower.split())
                overlap = len(skill_words.intersection(pool_words))
                if overlap > 0:
                    matches.append((pool_skill, overlap * 0.3))
        
        matches.sort(key=lambda x: x[1], reverse=True)
        return [m[0] for m in matches[:top_k]]


# Global instance
_matcher_instance = None

def get_matcher() -> KeywordMatcher:
    """Get or create the global matcher instance"""
    global _matcher_instance
    if _matcher_instance is None:
        _matcher_instance = KeywordMatcher()
    return _matcher_instance
