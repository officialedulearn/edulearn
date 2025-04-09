"use client"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

interface Question {
  question: string
  options: string[]
  correctAnswer: string
  explanation: string
}

interface QuestionCardProps {
  question: Question
  selectedAnswer?: string
  onSelectAnswer: (answer: string) => void
}

export default function QuestionCard({ question, selectedAnswer, onSelectAnswer }: QuestionCardProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">{question.question}</h3>

      <RadioGroup value={selectedAnswer} onValueChange={onSelectAnswer} className="space-y-3">
        {question.options.map((option, index) => (
          <div key={index} className="flex items-center space-x-2 p-3 rounded-md border hover:bg-gray-50">
            <RadioGroupItem value={option} id={`option-${index}`} />
            <Label htmlFor={`option-${index}`} className="flex-grow cursor-pointer">
              {option}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  )
}

