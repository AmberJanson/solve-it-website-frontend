describe('using the detailpages', () => {

      beforeEach(() => {
      
      // Intercepts
      cy.intercept('GET', '/api/categories', {statusCode: 200, body : [
              {id: "CategoryId1", name: "Category1", description: "Description1", techniques: ["TechniqueId1"]},
              {id: "CategoryId2", name: "Category2", description: "Description2", techniques: ["TechniqueId2"]}
          ]
      }).as('getCategories');
      cy.intercept('GET', '/api/techniques', {statusCode: 200, body : [
              {id: "TechniqueId1", name: "Technique1", description: "", synonyms: [], details: "Details1", subtechniques: ["TechniqueId1"], examples: ["Example1", "Example2"], weaknesses: ["WeaknessId1"], CASE_output_classes: [], references: ["Reference1", "Reference2"]},
              {id: "TechniqueId2", name: "Technique2", description: "Description2", synonyms: ["Synonym1", "Synonym2"], details: "Details2", subtechniques: ["TechniqueId1"], examples: ["Example1", "Example2"], weaknesses: ["WeaknessId1"], CASE_output_classes: ["Class1"], references: ["Reference1", "Reference2"]}
          ]
      }).as('getTechniques');
      cy.intercept('GET', '/api/weaknesses', {statusCode: 200, body : [
              {id: "WeaknessId1", name: "Weakness1", details: "Details1", risks: ["Risk1", "Risk2"], mitigations: ["MitigationId1"], references: ["Reference1", "Reference2"]}
          ]
      }).as('getWeaknesses');
      cy.intercept('GET', '/api/mitigations', {statusCode: 200, body : [
              {id: "MitigationId1", name: "Mitigation1", technique: "TechniqueId1", references: ["Reference1", "Reference2"]}
          ]
      }).as('getMitigations');

      cy.intercept('GET', '/api/techniques?techniqueId=TechniqueId1', {statusCode: 200, body : {
          id: "TechniqueId1", name: "Technique1", description: "", synonyms: [], details: "Details1", subtechniques: ["TechniqueId1"], examples: ["Example1", "Example2"], weaknesses: ["WeaknessId1"], CASE_output_classes: [], references: ["Reference1", "Reference2"]
        }
      }).as('getTechnique');
      cy.intercept('GET', '/api/weaknesses?weaknessId=WeaknessId1', {statusCode: 200, body : {
          id: "WeaknessId1", name: "Weakness1", details: "Details1", risks: ["Risk1", "Risk2"], mitigations: ["MitigationId1"], references: ["Reference1", "Reference2"]
        }
      }).as('getWeakness');

      cy.visit('http://localhost:4200/techniques/TechniqueId1');

      cy.wait('@getCategories');
      cy.wait('@getTechniques');
      cy.wait('@getWeaknesses');
      cy.wait('@getMitigations');
      cy.wait('@getTechnique');
      cy.wait('@getWeakness');
  });

  // Test 1
  it('Should show attributes and/or warning messages that attributes are missing when page is loaded', () => {
    cy.get('#description').find('.technique-description').should('exist');
    cy.get('#synonyms').contains('No synonyms for this technique are known yet.');
    cy.get('#details').contains('Details1');
    cy.get('#subtechniques').find('.entities').should('exist');
    cy.get('#examples').find('.entities').should('exist');
    cy.get('#weaknesses').find('.entities').should('exist');
    cy.get('#case_output_classes').contains('No case output classes for this technique are known yet.');
    cy.get('#references').find('.entities').should('exist');
  });

  // Test 2
  it('Should go to location of attribute on the page when attribute is clicked in the table of contents', () => {
    cy.get('.toc').contains('a', 'Weakness').click();
    cy.location('hash').should('eq', '#weaknesses')
    cy.get('#weaknesses').should('exist').and('be.visible');

    cy.get('.toc').contains('a', 'References').click();
    cy.location('hash').should('eq', '#references')
    cy.get('#references').should('exist').and('be.visible');

    cy.get('.toc').contains('a', 'Description').click();
    cy.location('hash').should('eq', '#description')
    cy.get('#description').should('exist').and('be.visible');
  });

  // Test 3
  it('Should go to detailpage of weakness1 when clicked on link for weakness1', () => {
    cy.intercept('GET', '/api/mitigations?mitigationId=MitigationId1', {statusCode: 200, body : {
            id: "MitigationId1", name: "Mitigation1", technique: "TechniqueId1", references: ["Reference1", "Reference2"]
        }
    }).as('getMitigation');
    
    cy.contains('WeaknessId1').click();

    cy.wait('@getMitigation');

    cy.url().should('include', 'weaknesses/WeaknessId1');
    cy.get('p.page-path').should('contain.text', 'TechniqueId1: Technique1 >');
  });

  // Test 4
  it('Should go to an external link in a different tab when the Github link would be clicked', () => {
    cy.get('#description')
    .should('exist')
    .within(() => {
        cy.get('a.title-link')
        .should('have.attr', 'href', 'https://github.com/SOLVE-IT-DF/solve-it/blob/main/data/techniques/TechniqueId1.json')
        .and('have.attr', 'target', '_blank')
    });
  });

  // Test 5
  it('Should show no technique found when on detailpage of a technique that does not exist', () => {
    cy.get('.hamburger-button').click();
    cy.contains('Techniques').click();
    cy.contains('TechniqueId2').click();

    cy.get('.not-found').should('exist').contains('No technique found');

    cy.get('.page-path').should('not.exist');
    cy.get('#description').should('not.exist');
  });
})