import { useState, useEffect } from "react";
import { Plus, Brain, Edit, Trash2, ChevronLeft, ChevronRight, Eye, Shuffle, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import PropTypes from 'prop-types';

/**
 * FlashcardsSection Component
 * 
 * Provides a comprehensive flashcard management and study interface.
 * Features CRUD operations, study modes, and progress tracking.
 * Uses localStorage for persistence (can be upgraded to backend later).
 * 
 * @param {object} props
 * @param {string} props.workspaceId - UUID of the workspace
 */
const FlashcardsSection = ({ workspaceId }) => {
  // State management
  const [flashcards, setFlashcards] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [cardFront, setCardFront] = useState("");
  const [cardBack, setCardBack] = useState("");
  const [cardCategory, setCardCategory] = useState("");
  
  // Study mode state
  const [isStudyMode, setIsStudyMode] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [studyCards, setStudyCards] = useState([]);
  const [studyStats, setStudyStats] = useState({ correct: 0, incorrect: 0, remaining: 0 });

  // Load flashcards from localStorage on component mount
  useEffect(() => {
    loadFlashcards();
  }, [workspaceId]); // loadFlashcards is stable, no need to include

  /**
   * Load flashcards from localStorage
   */
  const loadFlashcards = () => {
    try {
      const stored = localStorage.getItem(`flashcards_${workspaceId}`);
      if (stored) {
        const cards = JSON.parse(stored);
        setFlashcards(cards);
      }
    } catch (error) {
      console.error('Error loading flashcards:', error);
    }
  };

  /**
   * Save flashcards to localStorage
   */
  const saveFlashcards = (cards) => {
    try {
      localStorage.setItem(`flashcards_${workspaceId}`, JSON.stringify(cards));
      setFlashcards(cards);
    } catch (error) {
      console.error('Error saving flashcards:', error);
    }
  };

  /**
   * Create a new flashcard
   */
  const handleCreateCard = () => {
    if (!cardFront.trim() || !cardBack.trim()) return;

    const newCard = {
      id: Date.now().toString(),
      front: cardFront.trim(),
      back: cardBack.trim(),
      category: cardCategory.trim() || 'General',
      created: new Date().toISOString(),
      studied: 0,
      correct: 0
    };

    const updatedCards = [newCard, ...flashcards];
    saveFlashcards(updatedCards);
    resetForm();
  };

  /**
   * Update an existing flashcard
   */
  const handleUpdateCard = () => {
    if (!editingCard || !cardFront.trim() || !cardBack.trim()) return;

    const updatedCards = flashcards.map(card => 
      card.id === editingCard.id 
        ? { ...card, front: cardFront.trim(), back: cardBack.trim(), category: cardCategory.trim() || 'General' }
        : card
    );
    
    saveFlashcards(updatedCards);
    resetForm();
  };

  /**
   * Delete a flashcard
   */
  const handleDeleteCard = (cardId) => {
    if (window.confirm("Are you sure you want to delete this flashcard?")) {
      const updatedCards = flashcards.filter(card => card.id !== cardId);
      saveFlashcards(updatedCards);
    }
  };

  /**
   * Start editing a flashcard
   */
  const handleEditCard = (card) => {
    setEditingCard(card);
    setCardFront(card.front);
    setCardBack(card.back);
    setCardCategory(card.category);
    setIsDialogOpen(true);
  };

  /**
   * Reset form state
   */
  const resetForm = () => {
    setEditingCard(null);
    setCardFront("");
    setCardBack("");
    setCardCategory("");
    setIsDialogOpen(false);
  };

  /**
   * Start study mode
   */
  const startStudyMode = (shuffle = false) => {
    if (flashcards.length === 0) return;
    
    let cards = [...flashcards];
    if (shuffle) {
      cards = cards.sort(() => Math.random() - 0.5);
    }
    
    setStudyCards(cards);
    setCurrentCardIndex(0);
    setShowAnswer(false);
    setIsStudyMode(true);
    setStudyStats({ correct: 0, incorrect: 0, remaining: cards.length });
  };

  /**
   * End study mode
   */
  const endStudyMode = () => {
    setIsStudyMode(false);
    setStudyCards([]);
    setCurrentCardIndex(0);
    setShowAnswer(false);
  };

  /**
   * Navigate to next card in study mode
   */
  const nextCard = () => {
    if (currentCardIndex < studyCards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setShowAnswer(false);
    }
  };

  /**
   * Navigate to previous card in study mode
   */
  const previousCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setShowAnswer(false);
    }
  };

  /**
   * Mark answer as correct/incorrect
   */
  const markAnswer = (isCorrect) => {
    const currentCard = studyCards[currentCardIndex];
    
    // Update card statistics
    const updatedCards = flashcards.map(card => 
      card.id === currentCard.id 
        ? { 
            ...card, 
            studied: card.studied + 1,
            correct: isCorrect ? card.correct + 1 : card.correct
          }
        : card
    );
    saveFlashcards(updatedCards);
    
    // Update study stats
    setStudyStats(prev => ({
      correct: isCorrect ? prev.correct + 1 : prev.correct,
      incorrect: isCorrect ? prev.incorrect : prev.incorrect + 1,
      remaining: Math.max(0, prev.remaining - 1)
    }));
    
    // Auto advance to next card
    setTimeout(() => {
      nextCard();
    }, 1000);
  };

  /**
   * Get unique categories
   */
  const getCategories = () => {
    const categories = [...new Set(flashcards.map(card => card.category))];
    return categories.filter(Boolean);
  };

  /**
   * Format study statistics
   */
  const getAccuracyRate = (card) => {
    if (card.studied === 0) return 0;
    return Math.round((card.correct / card.studied) * 100);
  };

  // Study mode view
  if (isStudyMode && studyCards.length > 0) {
    const currentCard = studyCards[currentCardIndex];
    const isLastCard = currentCardIndex === studyCards.length - 1;
    
    return (
      <div className="max-w-2xl mx-auto">
        {/* Study Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={endStudyMode}
              className="hover:bg-red-50 hover:border-red-200"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Exit Study
            </Button>
            <div className="text-sm text-gray-600">
              Card {currentCardIndex + 1} of {studyCards.length}
            </div>
          </div>
          <div className="flex items-center space-x-4 text-sm">
            <div className="text-green-600">✓ {studyStats.correct}</div>
            <div className="text-red-600">✗ {studyStats.incorrect}</div>
            <div className="text-gray-600">Remaining: {studyStats.remaining}</div>
          </div>
        </div>

        {/* Study Card */}
        <Card className="min-h-[400px] mb-6 cursor-pointer" onClick={() => setShowAnswer(!showAnswer)}>
          <CardContent className="flex items-center justify-center text-center p-8">
            <div>
              <div className="mb-4">
                <Badge variant="outline">{currentCard.category}</Badge>
              </div>
              
              {!showAnswer ? (
                <>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{currentCard.front}</h3>
                  <p className="text-gray-500 mb-6">Click to reveal answer</p>
                  <Button onClick={() => setShowAnswer(true)}>
                    <Eye className="h-4 w-4 mr-2" />
                    Show Answer
                  </Button>
                </>
              ) : (
                <>
                  <h3 className="text-xl text-gray-600 mb-4">{currentCard.front}</h3>
                  <div className="border-t pt-4">
                    <h4 className="text-2xl font-bold text-indigo-600 mb-6">{currentCard.back}</h4>
                    <div className="flex justify-center space-x-4">
                      <Button
                        onClick={(e) => { e.stopPropagation(); markAnswer(false); }}
                        variant="outline"
                        className="bg-red-50 hover:bg-red-100 border-red-200 text-red-700"
                      >
                        Incorrect
                      </Button>
                      <Button
                        onClick={(e) => { e.stopPropagation(); markAnswer(true); }}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        Correct
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={previousCard}
            disabled={currentCardIndex === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          
          {isLastCard ? (
            <Button onClick={endStudyMode} className="bg-green-600 hover:bg-green-700 text-white">
              Finish Study Session
            </Button>
          ) : (
            <Button
              onClick={nextCard}
              disabled={currentCardIndex === studyCards.length - 1}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Main flashcards view
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Flashcards</h2>
          <p className="text-gray-600">{flashcards.length} cards • {getCategories().length} categories</p>
        </div>
        <div className="flex items-center space-x-2">
          {flashcards.length > 0 && (
            <>
              <Button
                variant="outline"
                onClick={() => startStudyMode(true)}
                className="bg-green-50 hover:bg-green-100 border-green-200 text-green-700"
              >
                <Shuffle className="h-4 w-4 mr-2" />
                Study (Shuffle)
              </Button>
              <Button
                variant="outline"
                onClick={() => startStudyMode(false)}
                className="bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700"
              >
                <Target className="h-4 w-4 mr-2" />
                Study (Order)
              </Button>
            </>
          )}
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            if (!open) resetForm();
            setIsDialogOpen(open);
          }}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200">
                <Plus className="h-4 w-4 mr-2" />
                Add Flashcard
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingCard ? "Edit Flashcard" : "Add New Flashcard"}</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="card-front">Front (Question)</Label>
                  <Textarea
                    id="card-front"
                    value={cardFront}
                    onChange={(e) => setCardFront(e.target.value)}
                    placeholder="Enter the question or prompt..."
                    className="mt-1 min-h-[100px]"
                  />
                </div>
                <div>
                  <Label htmlFor="card-back">Back (Answer)</Label>
                  <Textarea
                    id="card-back"
                    value={cardBack}
                    onChange={(e) => setCardBack(e.target.value)}
                    placeholder="Enter the answer or explanation..."
                    className="mt-1 min-h-[100px]"
                  />
                </div>
                <div>
                  <Label htmlFor="card-category">Category (Optional)</Label>
                  <Input
                    id="card-category"
                    value={cardCategory}
                    onChange={(e) => setCardCategory(e.target.value)}
                    placeholder="e.g., Math, History, Science..."
                    className="mt-1"
                  />
                </div>
                <Button 
                  onClick={editingCard ? handleUpdateCard : handleCreateCard}
                  className="w-full"
                  disabled={!cardFront.trim() || !cardBack.trim()}
                >
                  {editingCard ? "Update Flashcard" : "Create Flashcard"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Categories */}
      {getCategories().length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Categories:</h3>
          <div className="flex flex-wrap gap-2">
            {getCategories().map(category => (
              <Badge key={category} variant="outline" className="bg-purple-50 text-purple-700">
                {category} ({flashcards.filter(card => card.category === category).length})
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Flashcards Grid */}
      {flashcards.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {flashcards.map((card) => (
            <Card key={card.id} className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02] bg-white/70 backdrop-blur-sm border-gray-200/50">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <Brain className="h-5 w-5 text-purple-500" />
                    <Badge variant="outline" className="text-xs">{card.category}</Badge>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEditCard(card)}
                      className="h-8 w-8 p-0 hover:bg-purple-100"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteCard(card.id)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Question:</p>
                    <p className="text-gray-900 font-medium line-clamp-2">{card.front}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Answer:</p>
                    <p className="text-gray-700 text-sm line-clamp-2">{card.back}</p>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
                    <span>Studied: {card.studied} times</span>
                    {card.studied > 0 && (
                      <span className={`font-medium ${
                        getAccuracyRate(card) >= 80 ? 'text-green-600' :
                        getAccuracyRate(card) >= 60 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {getAccuracyRate(card)}% accuracy
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Brain className="h-8 w-8 text-purple-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No flashcards yet</h3>
          <p className="text-gray-500 mb-4">Create your first flashcard to start studying!</p>
          <p className="text-sm text-gray-400">Flashcards help you memorize concepts through active recall</p>
        </div>
      )}
    </div>
  );
};

FlashcardsSection.propTypes = {
  workspaceId: PropTypes.string.isRequired,
};

export default FlashcardsSection;