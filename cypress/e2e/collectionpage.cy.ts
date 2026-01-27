describe('using the collectionpages', () => {

    beforeEach(() => {
      
      // Intercepts
        cy.intercept('GET', '/api/categoryViews', {statusCode: 200, body : [
                {id: "ViewId1", name: "CategoryView1", short_description: "ShortDescription1", long_description: "LongDescription1", categories: ["CategoryId1", "CategoryId2"]},
                {id: "ViewId2", name: "CategoryView2", short_description: "ShortDescription2", long_description: "LongDescription2", categories: ["CategoryId1"]},
                {id: "ViewId3", name: "CategoryView3", short_description: "ShortDescription3", long_description: "LongDescription3", categories: ["CategoryId3", "CategoryId4"]}
            ]
        }).as('getCategoryViews');
      cy.intercept('GET', '/api/categories', {statusCode: 200, body : [
              {id: "CategoryId1", name: "Category1", description: "Description1", techniques: ["TechniqueId1"]},
              {id: "CategoryId2", name: "Category2", description: "Description2", techniques: ["TechniqueId1"]}
          ]
      }).as('getCategories');
      cy.intercept('GET', '/api/techniques', {statusCode: 200, body : [
              {id: "TechniqueId1", name: "B-Technique1", description: "Description1", synonyms: ["Synonym1", "Synonym2"], details: "Details1", subtechniques: ["TechniqueId1"], examples: ["Example1", "Example2"], weaknesses: ["WeaknessId1"], CASE_output_classes: ["Class1"], references: ["Reference1", "Reference2"]},
              {id: "TechniqueId2", name: "A-Technique2", description: "", synonyms: ["Synonym1", "Synonym2"], details: "Details2", subtechniques: ["TechniqueId1"], examples: ["Example1", "Example2"], weaknesses: ["WeaknessId1"], CASE_output_classes: ["Class1"], references: ["Reference1", "Reference2"]}
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

      cy.visit('http://localhost:4200');

      cy.wait('@getCategoryViews');
      cy.wait('@getCategories');
      cy.wait('@getTechniques');
      cy.wait('@getWeaknesses');
      cy.wait('@getMitigations');

      cy.get('.hamburger-button').click();
      cy.contains('Techniques').click();
  });

  // Test 1
  it('Should show technique attributes in table rows when techniques are loaded', () => {
    cy.get('.entities').should('exist');
    cy.get('.entities').find('tr').contains('td', 'Description1').should('exist');
    cy.get('.entities').find('tr').contains('td', 'No description for this technique is known yet.').should('exist');
    cy.get('.entities').find('tr').contains('td', 'ViewId1: CategoryView1').should('exist');
    cy.get('.entities').find('tr').contains('td', 'CategoryId1: Category1').should('exist');
    cy.get('.entities').find('tr').contains('td', 'CategoryId2: Category2').should('exist');
    cy.get('.entities').find('tr').contains('td', "This technique isn't added to any view or category.").should('exist');
  });

  // Test 2
  it('Should sort techniques on name from A to Z when sorting on name (A to Z) is selected', () => {
    cy.get('.entities tbody tr:first td.id').should('contain.text', 'TechniqueId1');
    cy.get('.entities tbody tr:first td.name').should('contain.text', 'B-Technique1');

    cy.get('.selection-bar select').select('nameAsc');

    cy.get('.entities tbody tr:first td.id').should('contain.text', 'TechniqueId2');
    cy.get('.entities tbody tr:first td.name').should('contain.text', 'A-Technique2');
  });

  // Test 3
  it('Should filter techniques out when they do not match the filters', () => {
    cy.get('.filters-toggle').click();
    cy.get('#synonyms').select('Present');
    cy.get('#details').select('Present');
    cy.get('#subtechniques').select('1-2 entries');
    cy.get('#examples').select('Present');
    cy.get('#subtechniques').select('1-2 entries');
    cy.get('#CASE_output_classes').select('Present');
    cy.get('#references').select('Present');

    cy.get('.entities tbody tr').should('have.length', 2);

    cy.get('#description').select('Absent');

    cy.get('.entities tbody tr').should('have.length', 1);
  });

  // Test 4
  it('Should show that no techniques are found when no technique matches the filters', () => {
    cy.get('.filters-toggle').click();
    cy.get('#description').select('Absent');
    cy.get('#synonyms').select('Present');
    cy.get('#details').select('Present');
    cy.get('#subtechniques').select('1-2 entries');
    cy.get('#examples').select('Present');
    cy.get('#subtechniques').select('1-2 entries');
    cy.get('#CASE_output_classes').select('Present');
    cy.get('#references').select('Absent');
    cy.get('.filters-toggle').click();

    cy.get('.entities').should('not.exist');
    cy.get('.not-found').should('exist');
  });

  // Test 5
  it('Should show all techniques again when reset filters is clicked', () => {
    cy.get('.filters-toggle').click();
    cy.get('#description').select('Absent');
    cy.get('#synonyms').select('Present');
    cy.get('#details').select('Present');
    cy.get('#subtechniques').select('1-2 entries');
    cy.get('#examples').select('Present');
    cy.get('#subtechniques').select('1-2 entries');
    cy.get('#CASE_output_classes').select('Present');
    cy.get('#references').select('Absent');

    cy.get('.entities').should('not.exist');

    cy.get('.reset-button').click();

    cy.get('.entities').should('exist');
    cy.get('.entities tbody tr').should('have.length', 2);
  });

  // Test 6
  it('Should go to detailpage of technique1 when clicked on link for technique1', () => {
        cy.intercept('GET', '/api/techniques?techniqueId=TechniqueId1', {statusCode: 200, body : {
                id: "TechniqueId1", name: "B-Technique1", description: "Description1", synonyms: ["Synonym1", "Synonym2"], details: "Details1", subtechniques: ["TechniqueId1"], examples: ["Example1", "Example2"], weaknesses: ["WeaknessId1"], CASE_output_classes: ["Class1"], references: ["Reference1", "Reference2"]
            }
        }).as('getTechnique');
        cy.intercept('GET', '/api/weaknesses?weaknessId=WeaknessId1', {statusCode: 200, body : {
                id: "WeaknessId1", name: "Weakness1", details: "Details1", risks: ["Risk1", "Risk2"], mitigations: ["MitigationId1"], references: ["Reference1", "Reference2"]
            }
        }).as('getWeakness');

        cy.get('.entities tbody tr').contains('B-Technique1').click();

        cy.wait('@getTechnique');
        cy.wait('@getWeakness');

        cy.url().should('include', 'techniques/TechniqueId1');
        cy.get('p.page-path').should('contain.text', 'TechniqueId1: B-Technique1');
  });
})