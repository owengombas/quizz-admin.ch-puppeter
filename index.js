const pupp = require('puppeteer')
const questions = require('./data/questions')

const name = '4INF-HP-M'
const delay = 0

const main = async () => {
  const browser = await pupp.launch({headless: false})
  const quizPage = await browser.newPage()
  await quizPage.goto('https://www.admin.ch/gov/fr/accueil/conseil-federal/quiz.html', {waitUntil: 'networkidle2'})
  
  // Select the game frame
  const quizFrame = quizPage.frames()[1]
  await quizFrame.waitForSelector('.startquiz')
  await quizFrame.click('.startquiz')
  await quizFrame.waitForSelector('#RegisterUnverifiedParticipantForm')
  await quizFrame.type('#registerunverifiedparticipantform-username', name, {delay: 5})
  
  // JQuery Error => click two times with a delay
  await quizFrame.click('#RegisterUnverifiedParticipantForm button')
  await quizPage.waitFor(200)
  await quizFrame.click('#RegisterUnverifiedParticipantForm button')

  // Quizz begin
  await quizFrame.waitForSelector('.answers')

  const yeah = async () => {
    let question = await quizFrame.evaluate(() => document.querySelector('#questioncontainer fieldset header h1').textContent)
    question = question.substring(3, question.length).replace('\n', '').trim()
    const answer = questions.get(question)
    await quizFrame.$$eval('.answers li', (nodes, answer) => {
      const answerElement = nodes.find(node => node.textContent.trim() === answer.trim())
      if (answerElement) {
        answerElement.firstChild.firstChild.firstChild.click()
      }
    }, answer)
  }

  while (true) {
    await yeah()
    if (delay) {
      await quizPage.waitFor(delay)
    }
  }

  // await browser.close()
}

main()
