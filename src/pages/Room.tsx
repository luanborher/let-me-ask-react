import '../styles/room.scss'

import { FormEvent, useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'

import { AiOutlineEdit } from 'react-icons/ai'
import { Button } from '../components/Button'
import { Footer } from '../components/Footer/index'
import { Question } from '../components/Question'
import ReactModal from 'react-modal'
import { RoomCode } from '../components/RoomCode'
import { database } from '../services/firebase'
import logoImg from '../assets/images/logo.svg'
import { useAuth } from '../hooks/useAuth'
import { useEffect } from 'react'
import { useRoom } from '../hooks/useRoom'

type RoomParams = {
  id: string
}

export function Room() {
  const history = useHistory()
  const { user } = useAuth()
  const params = useParams<RoomParams>()
  const [newQuestion, setNewQuestion] = useState('')
  const [newQuestionId, setNewQuestionId] = useState('')
  const [author, setAuthor] = useState('')
  const [modal, setModal] = useState(false)
  const roomId = params.id
  const { title, questions } = useRoom(roomId)

  const customStyles = {
    content: {
      background: '#f8f8f8',
      borderColor: '#835afd',
      width: '50%',
      height: 'auto',
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      display: 'flex',
      justifyContent: 'center',
      fontFamily: 'sans-serif',
      fontSize: '24px',
      color: '#29292e',
      opacity: '1',
    },
    overlay: {
      background: '#1E011F7E',
      opacity: '1',
    },
  }

  useEffect(() => {
    const IdAuthor = database.ref(`rooms/${roomId}`)

    IdAuthor.on('value', (snapshot) => {
      const data = snapshot.val()
      let id = data.authorId
      localStorage.setItem('authorId', id)
      setAuthor(id)
    })
  }, [author, roomId])

  const handleSendQuestion = async (event: FormEvent) => {
    event.preventDefault()

    if (newQuestion.trim() === '') {
      return
    }

    if (!user) {
      throw new Error('You must be logged in')
    }

    const question = {
      content: newQuestion,
      author: {
        name: user.name,
        avatar: user.avatar,
      },
      isHighlighted: false,
      isAnswered: false,
    }

    await database.ref(`rooms/${roomId}/questions`).push(question)

    setNewQuestion('')
  }

  const handleLikeQuestion = async (
    questionId: string,
    likeId: string | undefined
  ) => {
    if (likeId) {
      await database
        .ref(`rooms/${roomId}/questions/${questionId}/likes/${likeId}`)
        .remove()
    } else {
      await database.ref(`rooms/${roomId}/questions/${questionId}/likes`).push({
        authorId: user?.id,
      })
    }
  }

  const handleRenameQuestion = async (event: FormEvent) => {
    event.preventDefault()

    await database.ref(`rooms/${roomId}/questions/${newQuestionId}`).update({
      content: newQuestion,
    })

    setNewQuestion('')
  }

  const abrirModal = (questionId: string) => {
    setModal(true)
    setNewQuestionId(questionId)
  }

  const fecharModal = () => {
    setModal(false)
  }

  const modoAdministrador = () => {
    history.push(`/admin/rooms/${roomId}`)
  }

  return (
    <div id="page-room">
      <ReactModal
        style={customStyles}
        onRequestClose={() => setModal(false)}
        isOpen={modal}
        ariaHideApp={false}
      >
        <form
          onClick={handleRenameQuestion}
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '15px',
            padding: '15px',
          }}
        >
          <textarea
            style={{
              width: '100%',
              border: '04',
              padding: '16px',
              borderRadius: '8px',
              background: '#fff',
              boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
              resize: 'vertical',
              minHeight: '120px',
            }}
            placeholder="Troque sua pergunta..."
            onChange={(event) => setNewQuestion(event.target.value)}
            value={newQuestion}
          />
          <Button
            type="submit"
            disabled={!user}
            style={{ alignSelf: 'flex-end', width: '45%' }}
            onClick={fecharModal}
          >
            Enviar pergunta
          </Button>
        </form>
      </ReactModal>
      <header>
        <div className="content">
          <img src={logoImg} alt="Letmeask" />
          <div>
            {user?.id === author && (
              <button
                className="button-admin"
                style={{ borderRadius: '8px', padding: '10px' }}
                onClick={modoAdministrador}
              >
                Administrador
              </button>
            )}

            <RoomCode code={roomId} />
          </div>
        </div>
      </header>

      <main>
        <div className="room-title">
          <h1>Sala {title}</h1>
          {questions.length > 0 && <span>{questions.length} pergunta(s)</span>}
        </div>

        <form onSubmit={handleSendQuestion}>
          <textarea
            placeholder="O que você quer perguntar?"
            onChange={(event) => setNewQuestion(event.target.value)}
            value={newQuestion}
          />

          <div className="form-footer">
            {user ? (
              <div className="user-info">
                <img src={user.avatar} alt={user.name} />
                <span>{user.name}</span>
              </div>
            ) : (
              <span>
                Para enviar uma pergunta, <button>faça seu login</button>.
              </span>
            )}
            <Button type="submit" disabled={!user}>
              Enviar pergunta
            </Button>
          </div>
        </form>

        <div className="question-list">
          {questions.map((question) => {
            return (
              <Question
                key={question.id}
                content={question.content}
                author={question.author}
                isAnswered={question.isAnswered}
                isHighlighted={question.isHighlighted}
              >
                {!question.isAnswered && question.author.name === user?.name && (
                  <button
                    type="button"
                    aria-label="Editar pergunta"
                    onClick={() => {
                      abrirModal(question.id)
                    }}
                  >
                    <AiOutlineEdit
                      style={{ display: 'flex' }}
                      aria-label="Editar pergunta"
                      size={26}
                      color="#835afd"
                    />
                  </button>
                )}

                {!question.isAnswered && (
                  <button
                    className={`like-button ${question.likeId ? 'liked' : ''}`}
                    type="button"
                    aria-label="Marcar como gostei"
                    onClick={() =>
                      handleLikeQuestion(question.id, question.likeId)
                    }
                  >
                    {question.likeCount > 0 && (
                      <span>{question.likeCount}</span>
                    )}
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M7 22H4C3.46957 22 2.96086 21.7893 2.58579 21.4142C2.21071 21.0391 2 20.5304 2 20V13C2 12.4696 2.21071 11.9609 2.58579 11.5858C2.96086 11.2107 3.46957 11 4 11H7M14 9V5C14 4.20435 13.6839 3.44129 13.1213 2.87868C12.5587 2.31607 11.7956 2 11 2L7 11V22H18.28C18.7623 22.0055 19.2304 21.8364 19.5979 21.524C19.9654 21.2116 20.2077 20.7769 20.28 20.3L21.66 11.3C21.7035 11.0134 21.6842 10.7207 21.6033 10.4423C21.5225 10.1638 21.3821 9.90629 21.1919 9.68751C21.0016 9.46873 20.7661 9.29393 20.5016 9.17522C20.2371 9.0565 19.9499 8.99672 19.66 9H14Z"
                        stroke="#737380"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                )}
              </Question>
            )
          })}
        </div>
      </main>
      <Footer />
    </div>
  )
}
