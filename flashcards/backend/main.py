from fastapi import FastAPI, Depends
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from backend.db import Flashcard, SessionLocal
from pathlib import Path
import random
from pydantic import BaseModel

class CardData(BaseModel):
    question: str
    answer: str

class AnswerData(BaseModel):
    card_id: int
    correct: bool

app = FastAPI()
BASE_DIR = Path(__file__).resolve().parent.parent
FRONTEND_DIR = BASE_DIR / "frontend"

app.mount("/static", StaticFiles(directory=FRONTEND_DIR), name="static")

# DB dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Serve pages
@app.get("/")
def serve_home():
    return FileResponse(FRONTEND_DIR / "index.html")

@app.get("/practice")
def serve_practice():
    return FileResponse(FRONTEND_DIR / "practice.html")

# CRUD endpoints
@app.post("/add-card")
def add_card(data: CardData, db: Session = Depends(get_db)):
    card = Flashcard(question=data.question, answer=data.answer)
    db.add(card)
    db.commit()
    db.refresh(card)
    return {"message": "Card added", "id": card.id}

@app.get("/all-cards")
def all_cards(db: Session = Depends(get_db)):
    cards = db.query(Flashcard).all()
    return [{"id": c.id, "question": c.question, "answer": c.answer, "score": c.score} for c in cards]

@app.post("/answer")
def answer_card(data: AnswerData, db: Session = Depends(get_db)):
    card = db.query(Flashcard).filter(Flashcard.id == data.card_id).first()
    if not card:
        return JSONResponse({"error": "Card not found"}, status_code=404)
    card.score = card.score + 1 if data.correct else max(0, card.score - 1)
    db.commit()
    return {"message": "Updated", "score": card.score}

@app.delete("/delete-card/{card_id}")
def delete_card(card_id: int, db: Session = Depends(get_db)):
    card = db.query(Flashcard).filter(Flashcard.id == card_id).first()
    if not card:
        return JSONResponse({"error": "Card not found"}, status_code=404)
    db.delete(card)
    db.commit()
    return {"message": "Deleted"}

@app.put("/edit-card/{card_id}")
def edit_card(card_id: int, data: CardData, db: Session = Depends(get_db)):
    card = db.query(Flashcard).filter(Flashcard.id == card_id).first()
    if not card:
        return JSONResponse({"error": "Card not found"}, status_code=404)
    card.question = data.question
    card.answer = data.answer
    db.commit()
    return {"message": "Updated"}
