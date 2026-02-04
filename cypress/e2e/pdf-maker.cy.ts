describe('using the PDF maker', () => {

  beforeEach(() => {
      
    // Intercepts
    cy.intercept('GET', '/api/categories', {statusCode: 200, body : [
            {id: "CategoryId1", name: "Category1", description: "Description1", techniques: ["TechniqueId1"]},
            {id: "CategoryId2", name: "Category2", description: "Description2", techniques: ["TechniqueId2"]}
        ]
    }).as('getCategories');
    cy.intercept('GET', '/api/techniques', {statusCode: 200, body : [
            {id: "TechniqueId1", name: "Technique1", description: "Description1", synonyms: ["Synonym1", "Synonym2"], details: "Details1", subtechniques: ["TechniqueId1"], examples: ["Example1", "Example2"], weaknesses: ["WeaknessId1"], CASE_output_classes: ["Class1"], references: ["Reference1", "Reference2"]},
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
            id: "TechniqueId1", name: "Technique1", description: "Description1", synonyms: ["Synonym1", "Synonym2"], details: "Details1", subtechniques: ["TechniqueId1"], examples: ["Example1", "Example2"], weaknesses: ["WeaknessId1"], CASE_output_classes: ["Class1"], references: ["Reference1", "Reference2"]
        }
    }).as('getTechnique');
    cy.intercept('GET', '/api/weaknesses?weaknessId=WeaknessId1', {statusCode: 200, body : {
            id: "WeaknessId1", name: "Weakness1", details: "Details1", risks: ["Risk1", "Risk2"], mitigations: ["MitigationId1"], references: ["Reference1", "Reference2"]
        }
    }).as('getWeakness');

    cy.visit('http://localhost:4200/techniques/TechniqueId1');

    // Waiting for the navigation http-requests and the technique detailpage http-request
    cy.wait('@getCategories');
    cy.wait('@getTechniques');
    cy.wait('@getWeaknesses');
    cy.wait('@getMitigations');
    cy.wait('@getTechnique');
    cy.wait('@getWeakness');

    cy.get('.pdf-checkbox')
    .find('input[type="checkbox"]')
    .check()
    .should('be.checked');

    // Intercept for the mitigations on the weakness detailpage
    cy.intercept('GET', '/api/mitigations?mitigationId=MitigationId1', {statusCode: 200, body : {
            id: "MitigationId1", name: "Mitigation1", technique: "TechniqueId1", references: ["Reference1", "Reference2"]
        }
    }).as('getMitigation');

    cy.contains('WeaknessId1').click();

    cy.wait('@getMitigation');

    cy.get('.pdf-checkbox')
    .find('input[type="checkbox"]')
    .check()
    .should('be.checked');

    cy.contains('MitigationId1').click();

    cy.get('.pdf-checkbox')
    .find('input[type="checkbox"]')
    .check()
    .should('be.checked');
  });

  // Test 1
  it('Should remove a pdfList item when clicked on bin icon in the row of that item', () => {
    cy.get('.hamburger-button').click();
    cy.contains('PDF Maker').click();

    cy.get('.entities').find('tr').contains('MitigationId1').parents('tr').should('contain.text', 'Mitigation1');
    cy.get('.fa-trash').eq(2).click();

    cy.get('.entities').find('tr').contains('WeaknessId1').parents('tr').should('contain.text', 'Weakness1');
    cy.get('.fa-trash').eq(1).click();

    cy.get('.entities').find('tr').contains('TechniqueId1').parents('tr').should('contain.text', 'Technique1');
    cy.get('.fa-trash').eq(0).click();

    cy.contains('No items in PDF-list found.');
  });

  // Test 2
  it('Should remove all pdfList items when clicked on remove all', () => {
    cy.get('.hamburger-button').click();
    cy.contains('PDF Maker').click();

    cy.get('th').contains('Remove all').click();
    cy.contains('No items in PDF-list found.');
  });

  // Test 3
  it('Should download pdf with all information when download button is clicked', () => {

    cy.get('.hamburger-button').click();
    cy.contains('PDF Maker').click();

    cy.get('.pdf-button').click();

    cy.get('.download-message').contains('The PDF-file has been downloaded!');
  });
})