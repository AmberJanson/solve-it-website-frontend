describe('using the aboutpage', () => {

  beforeEach(() => {
      
    // Intercepts
    cy.intercept('GET', '/categories', {statusCode: 200, body : [
            {id: "CategoryId1", name: "Category1", description: "Description1", techniques: ["TechniqueId1"]},
            {id: "CategoryId2", name: "Category2", description: "Description2", techniques: ["TechniqueId2"]}
        ]
    }).as('getCategories');
    cy.intercept('GET', '/techniques', {statusCode: 200, body : [
            {id: "TechniqueId1", name: "Technique1", description: "Description1", synonyms: ["Synonym1", "Synonym2"], details: "Details1", subtechniques: ["TechniqueId1"], examples: ["Example1", "Example2"], weaknesses: ["WeaknessId1"], CASE_output_classes: ["Class1"], references: ["Reference1", "Reference2"]},
            {id: "TechniqueId2", name: "Technique2", description: "Description2", synonyms: ["Synonym1", "Synonym2"], details: "Details2", subtechniques: ["TechniqueId1"], examples: ["Example1", "Example2"], weaknesses: ["WeaknessId1"], CASE_output_classes: ["Class1"], references: ["Reference1", "Reference2"]}
        ]
    }).as('getTechniques');
    cy.intercept('GET', '/weaknesses', {statusCode: 200, body : [
            {id: "WeaknessId1", name: "Weakness1", details: "Details1", risks: ["Risk1", "Risk2"], mitigations: ["MitigationId1"], references: ["Reference1", "Reference2"]}
        ]
    }).as('getWeaknesses');
    cy.intercept('GET', '/mitigations', {statusCode: 200, body : [
            {id: "MitigationId1", name: "Mitigation1", technique: "TechniqueId1", references: ["Reference1", "Reference2"]}
        ]
    }).as('getMitigations');

    cy.visit('http://localhost:4200/about');

    cy.wait('@getCategories');
    cy.wait('@getTechniques');
    cy.wait('@getWeaknesses');
    cy.wait('@getMitigations');
  });

  // Test 1
  it('Should see all information about the website when on the aboutpage', () => {
    cy.get('section.info-section')
    .should('have.length', 4)
    .each(($section) => {
        cy.wrap($section).within(() => {
            cy.get('h1').should('exist')
            cy.get('p').should('exist')
        });
    });
  });

  // Test 2
  it('Should go to an external link in a different tab when the contribution link would be clicked', () => {
    cy.get('#contribution')
    .should('exist')
    .within(() => {
        cy.get('p.description a')
        .should('have.attr', 'href', 'https://github.com/SOLVE-IT-DF/solve-it?tab=contributing-ov-file')
        .and('have.attr', 'target', '_blank')
    });
  });
})