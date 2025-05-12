from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import schemas, crud, models
from ..database import SessionLocal

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=schemas.Community)
def create_community(community: schemas.CommunityCreate, db: Session = Depends(get_db)):
    db_community = crud.get_community_by_name(db, name=community.name)
    if db_community:
        raise HTTPException(status_code=400, detail="Community already exists")
    return crud.create_community(db=db, community=community)

@router.get("/", response_model=list[schemas.Community])
def list_communities(db: Session = Depends(get_db)):
    return db.query(models.Community).all() 