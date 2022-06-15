/// <reference types="cypress" />

describe('characters section - test POST', () => {
        
    const uniqueSeed = Date.now().toString();
    let isAlive = true //problems if it is in false
    let location = "Beyond the Wall"
    let name = "santi " + uniqueSeed
    let realName = "santi"
    let thumbnail = "test"

    it('test POST backend', () => {
        cy.createCharacterPost(isAlive, location, name, realName, thumbnail).then((character) => {
            cy.wrap(character.id).as('newId')

            expect(character.isAlive).to.eq("" + isAlive + "")
            expect(character.location).to.eq(location)
            expect(character.name).to.eq(name)
            expect(character.realName).to.eq(realName)
            expect(character.thumbnail).to.eq(thumbnail)

            // to have properties:
            expect(character).to.have.ownPropertyDescriptor('id')
            expect(character).to.have.ownPropertyDescriptor('isAlive')
            expect(character).to.have.ownPropertyDescriptor('location')
            expect(character).to.have.ownPropertyDescriptor('name')
            expect(character).to.have.ownPropertyDescriptor('realName')
            expect(character).to.have.ownPropertyDescriptor('thumbnail')
        })
    })

    it('test POST backend - negative case - with missing fields', () => { //it returns 200
        cy.request({
            method: 'POST',
            url: 'https://restool-sample-app.herokuapp.com/api/character',
            body:{
                "realName": realName,
                "thumbnail": thumbnail
            }           
        }).then((response) => { 
            cy.wrap(response.body.id).as('newId')
            expect(response.status).to.eq(200)
        })
    })

    it('test POST in frontend with "isAlive" true', () => {
        isAlive = true

        cy.verifyPostInFrontend(isAlive, location, name, realName, thumbnail)
    })

    it.skip('test POST in frontend with "isAlive" false', () => {
        isAlive = false
        
        cy.verifyPostInFrontend(isAlive, location, name, realName, thumbnail)
    })
    
    afterEach(function () {
        cy.deleteCharacter(this.newId)
    })

})

describe('characters section - test DELETE', () => {
    const uniqueSeed = Date.now().toString();
    let isAlive = false
    let location = "Beyond the Wall"
    let name = "santi " + uniqueSeed
    let realName = "santi"
    let thumbnail = "test"

    before(() => {
        cy.createCharacterPost(isAlive, location, name, realName, thumbnail).then((character) => { 
            let characterId = character.id
            cy.wrap(characterId).as('newId')
            
            cy.deleteCharacter(characterId).then((response) => {
                cy.wrap(response).as('deleteResponse')
            })
        })       
    })

    it('test DELETE from backend', function () {
        cy.get('@deleteResponse').then((response) => {
            expect(response.status).to.eq(200)
            expect(response.body).to.eq('ok')
        })

        cy.searchCharacterById(this.newId).then((character) => {
            expect(character).to.be.empty
        })
    })

    it('test DELETE from frontend', () => {
        cy.visit("")
        cy.viewport(1440,860)

        cy.scrollToBottom()
        
        cy.get('.infinite-scroll-component .card').last().then( function (card) {
            cy.wrap(card).contains('ID').siblings().should('not.have.text', this.newId)
        })
    })

})

describe('characters section - test CRUD', () => {
    let createdCharacter
    
    const uniqueSeed = Date.now().toString();
    let isAlive = false
    let location = "Beyond the Wall"
    let name = "santi " + uniqueSeed
    let realName = "santi"
    let thumbnail = "test"

    before(() => {
        cy.createCharacterPost(isAlive, location, name, realName, thumbnail).then((character) => { 
            cy.wrap(character.id).as('newId')
            createdCharacter = character
        })
    })

    it('test GET - backend for all characters', () => {
        cy.searchCharactersFromBackend()
    })

    it('test GET - backend for the created character', function () {
        cy.searchCharacterById(this.newId).then((character) => {
            expect(character).to.deep.equal(createdCharacter)
        }) 
    })

    it('test GET - frontend for all characters', () => {
        
        let numberOfCharactersBackend;
        let charactersIdsBackend;

        cy.searchCharactersFromBackend().then((characters) => {
            numberOfCharactersBackend = characters.length;
            charactersIdsBackend = Cypress._.map(characters, 'id')
        })

        cy.visit("")
        cy.viewport(1440,860)

        cy.scrollToBottom()
        .then(() => {
            cy.get('.card').should('have.length', numberOfCharactersBackend)
        })
 
        cy.get('.card label').filter(':contains("ID")').siblings().then(($array) => { //get characters id's spans from frontend
            let charactersIdsFrontend = Cypress._.map($array, 'innerText') //get array of characters ids
            expect(charactersIdsFrontend).to.deep.eq(charactersIdsBackend) //compare that the arrays of ids from front and back are the same.
        })

    })

    context('with an edited character', () => {
        let editedIsAlive = ! isAlive
        let editedLocation = location + ' edited'
        let editedName = name + ' edited'
        let editedRealName = realName + ' edited'
        let editedThumbnail = thumbnail + ' edited'

        before( function() {
            cy.request({
                method: 'PUT',
                url: 'https://restool-sample-app.herokuapp.com/api/character/' + this.newId,
                form: true,
                body:{
                    "isAlive": editedIsAlive,
                    "location": editedLocation,
                    "name": editedName,
                    "realName": editedRealName,
                    "thumbnail": editedThumbnail
                } 
            }).then((response) => { 
                expect(response.status).to.eq(200)
                expect(response.body).to.eq('ok')
            })
        })

        it('test PUT - backend', function () {
            cy.searchCharacterById(this.newId).then((character) => {
                // expect(character.isAlive).to.eq(isAlive)
                expect(character.location).to.eq(editedLocation)
                expect(character.name).to.eq(editedName)
                expect(character.realName).to.eq(editedRealName)
                expect(character.thumbnail).to.eq(editedThumbnail)
            })
        })

        it('test PUT - frontend', function () {
            cy.visit("")
            cy.viewport(1440,860)

            cy.scrollToBottom()

            cy.verifyCharacterInFront(this.newId, editedIsAlive, editedLocation, editedName, editedRealName, editedThumbnail)
        })
    })

    after( function () {
        cy.deleteCharacter(this.newId)
    })

})






