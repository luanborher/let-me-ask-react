import '../styles/room.scss'

import { Button } from '../components/Button'
import { FormEvent } from 'react'
import { Question } from '../components/Question'
import { RoomCode } from '../components/RoomCode'
import { database } from '../services/firebase'
import logoImg from '../assets/images/logo.svg'
import { useAuth } from '../hooks/useAuth'
import { useParams } from 'react-router-dom'
import { useRoom } from '../hooks/useRoom'
import { useState } from 'react'

type RoomParams = {
  id: string
}

export const Room = () => {
  const { user } = useAuth()
  const params = useParams<RoomParams>()
  const roomId = params.id
  const [newQuestion, setNewQuestion] = useState('')
  const { questions, title } = useRoom(roomId)

  const handleSendQuestion = async (event: FormEvent) => {
    event.preventDefault()

    if (newQuestion.trim() === '') {
      return
    }

    if (!user) {
      throw new Error('You must be loggd in')
    }

    const question = {
      content: newQuestion,
      author: {
        name: user.name,
        avatar: user.avatar,
      },
      isHighLighted: false,
      isAnswered: false,
    }

    await database.ref(`rooms/${roomId}/questions`).push(question)

    setNewQuestion('')
  }

  return (
    <div id="page-room">
      <header>
        <div className="content">
          <img src={logoImg} alt="Letmeask" />
          <div>
            <RoomCode code={roomId} />
            <Button isOutLined>Encerrar sala</Button>
          </div>
        </div>
      </header>

      <main className="content">
        <div className="room-title">
          <h1>Sala {title}</h1>
          {questions.length > 0 && <span>{questions.length} Pergunta(s)</span>}
        </div>

        <div className="question-list">
          {questions.map((question) => {
            return (
              <Question
                key={question.id}
                content={question.content}
                author={question.author}
              />
            )
          })}
        </div>
      </main>
    </div>
  )
}
