describe('using the collectionpages', () => {

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

      cy.visit('http://localhost:4200');

      cy.wait('@getCategories');
      cy.wait('@getTechniques');
      cy.wait('@getWeaknesses');
      cy.wait('@getMitigations');
  });

  // Test 1
  it('Should show technique attributes in table rows when techniques are loaded', () => {

  });

  // Test 2
  it('Should sort techniques on name from A to Z when sorting on name (A to Z) is selected', () => {

  });

  // Test 3
  it('Should filter techniques out when they do not match the filters', () => {

  });

  // Test 4
  it('Should show all techniques again when reset filters is clicked', () => {

  });

  // Test 5
  it('Should go to detailpage of technique1 when clicked on link for technique1', () => {

  });

  // Test 6
  it('Should show that no techniques are found when no technique matches the filters', () => {

  });
})