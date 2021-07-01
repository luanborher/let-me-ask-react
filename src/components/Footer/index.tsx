import '../Footer/styles.scss'

import { AiFillGithub } from 'react-icons/ai'

export const Footer = () => {
  return (
    <div id="footer">
      <p>Projeto de estudo desenvolvida em ReactJS no Next Leavel Week</p>
      <div className="icone">
        <AiFillGithub aria-label="Editar pergunta" />
      </div>
    </div>
  )
}
