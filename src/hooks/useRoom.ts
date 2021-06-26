import { database } from '../services/firebase'
import { useEffect } from 'react'
import { useState } from 'react'

type QuestionType = {
    id: string
    author: {
      name: string
      avatar: string
    }
    content: string
    isHighLighted: boolean
    isAnswered: boolean
  }

  type FirebaseQuestion = Record<
  string,
  {
    author: {
      name: string
      avatar: string
    }
    content: string
    isHighLighted: boolean
    isAnswered: boolean
  }
>

export const useRoom = (roomId: string) => {
    const [questions, setQuestions] = useState<QuestionType[]>([])
    const [title, setTitle] = useState('')

    useEffect(() => {
        const roomRef = database.ref(`rooms/${roomId}`)
    
        roomRef.on('value', (room) => {
          const databaseRoom = room.val()
          const firebaseQuestion: FirebaseQuestion = databaseRoom.questions ?? {}
    
          const parsedQuestions = Object.entries(firebaseQuestion).map(
            ([key, value]) => {
              return {
                id: key,
                content: value.content,
                author: value.author,
                isAnswered: value.isAnswered,
                isHighLighted: value.isHighLighted,
              }
            },
          )
    
          setTitle(databaseRoom.title)
          setQuestions(parsedQuestions)
        })
      }, [roomId])

      return { questions, title}
}