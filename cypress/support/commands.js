// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })


Cypress.Commands.add('scrollToBottomUntilAllCardsAreDisplayed', (totalItems) => {
    cy.scrollTo('bottom')
    cy.wait(10)
    cy.get('.card').then((cards) => {
        let amountOfCards = cards.length
        if(amountOfCards != totalItems) {
            cy.scrollToBottomUntilAllCardsAreDisplayed(totalItems)
        }
    })
})

Cypress.Commands.add('scrollToBottom', () => {

    cy.get('p.pagination-state').invoke('text').then(($text) => { //get amount of items of 'showing x items'
        let totalItems = $text.split(' ')[1]
        cy.wrap(totalItems).then(parseInt).then((number) => {
            cy.scrollToBottomUntilAllCardsAreDisplayed(totalItems)
        })
    })
})

Cypress.Commands.add('searchCharacterById', (characterId) => {
    cy.request({
        method: 'GET',
        url: 'https://restool-sample-app.herokuapp.com/api/character/' + characterId,
        form: true           
    }).then((response) => { 
        expect(response.status).to.eq(200)
        expect(response.body).to.not.be.null
        return response.body
    })
})

Cypress.Commands.add('searchCharactersFromBackend', () => {
    cy.request({
        method: 'GET',
        url: 'https://restool-sample-app.herokuapp.com/api/character',
        form: true           
    }).then((response) => { 
        expect(response.status).to.eq(200)
        expect(response.body).to.not.be.null
        return response.body.items
    })
})


Cypress.Commands.add('createCharacterPost', (isAlive, location, name, realName, thumbnail) => {
    cy.request({
        method: 'POST',
        url: 'https://restool-sample-app.herokuapp.com/api/character',
        form:true,
        body:{
            "isAlive": isAlive,
            "location": location,
            "name": name,
            "realName": realName,
            "thumbnail": thumbnail
        }           
    }).then((response) => { 
        expect(response.status).to.eq(200)
        return response.body //return the created character
    })
})


Cypress.Commands.add('verifyCharacterInFront', (id, isAlive, location, name, realName, thumbnail) => {
    cy.get('.infinite-scroll-component .card:last-child').then((card) => {
        cy.wrap(card).contains('ID').siblings().should('have.text', id)
        cy.wrap(card).contains('Name').siblings().should('have.text', name)
        cy.wrap(card).contains('Real Name').siblings().should('have.text', realName)
        cy.wrap(card).contains('Location').siblings().should('have.text', location)
        cy.wrap(card).contains('Alive').siblings().should('have.class', isAlive)
        cy.wrap(card).find('img').should('have.attr', 'src', thumbnail)
    })
})


Cypress.Commands.add('verifyPostInFrontend', (isAlive, location, name, realName, thumbnail) => {

    cy.createCharacterPost(isAlive, location, name, realName, thumbnail).then((character) => { 
        cy.wrap(character.id).as('newId')
    })

    cy.viewport(1080,1080)
    cy.visit("")

    cy.scrollToBottom()
    .then(function () {
        cy.verifyCharacterInFront(this.newId, isAlive, location, name, realName, thumbnail)
    })

})


Cypress.Commands.add('deleteCharacter', (id) => {
    cy.request({
        method: 'DELETE',
        url: 'https://restool-sample-app.herokuapp.com/api/character/' + id          
    })
})

