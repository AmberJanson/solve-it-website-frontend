describe('using the detailpages', () => {

      beforeEach(() => {
      
      // Intercepts
      cy.intercept('GET', '/categories', {statusCode: 200, body : [
              {id: "CategoryId1", name: "Category1", description: "Description1", techniques: ["TechniqueId1"]},
              {id: "CategoryId2", name: "Category2", description: "Description2", techniques: ["TechniqueId2"]}
          ]
      }).as('getCategories');
      cy.intercept('GET', '/techniques', {statusCode: 200, body : [
              {id: "TechniqueId1", name: "Technique1", description: "", synonyms: [], details: "Details1", subtechniques: ["TechniqueId1"], examples: ["Example1", "Example2"], weaknesses: ["WeaknessId1"], CASE_output_classes: [], references: ["Reference1", "Reference2"]},
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

      cy.intercept('GET', '/techniques?techniqueId=TechniqueId1', {statusCode: 200, body : {
          id: "TechniqueId1", name: "Technique1", description: "", synonyms: [], details: "Details1", subtechniques: ["TechniqueId1"], examples: ["Example1", "Example2"], weaknesses: ["WeaknessId1"], CASE_output_classes: [], references: ["Reference1", "Reference2"]
        }
      }).as('getTechnique');
      cy.intercept('GET', '/weaknesses?weaknessId=WeaknessId1', {statusCode: 200, body : {
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
  });

  // Test 2
  it('Should go to location of attribute on the page when attribute is clicked in the table of contents', () => {
  });

  // Test 3
  it('Should go to detailpage of weakness1 when clicked on link for weakness1', () => {
  });

  // Test 4
  it('Should go to an external link in a different tab when the Github link would be clicked', () => {
  });
})