from pydantic import BaseModel, EmailStr
from typing import Optional, List

class CommunityUserBase(BaseModel):
    role: str

class CommunityUserCreate(CommunityUserBase):
    user_id: int
    community_id: int

class CommunityUser(CommunityUserBase):
    id: int
    user_id: int
    community_id: int
    class Config:
        orm_mode = True

class UserBase(BaseModel):
    email: EmailStr
    is_active: Optional[bool] = True
    is_superadmin: Optional[bool] = False

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    communities: List[CommunityUser] = []
    class Config:
        orm_mode = True

class CommunityBase(BaseModel):
    name: str
    is_active: Optional[bool] = True

class CommunityCreate(CommunityBase):
    pass

class Community(CommunityBase):
    id: int
    users: List[CommunityUser] = []
    class Config:
        orm_mode = True 