describe('using the searchbar', () => {

    beforeEach(() => {
        
        // Intercepts
        cy.intercept('GET', '/categoryViews', {statusCode: 200, body : [
                {id: "ViewId1", name: "CategoryView1", short_description: "ShortDescription1", long_description: "LongDescription1", categories: ["CategoryId1", "CategoryId2"]},
                {id: "ViewId2", name: "CategoryView2", short_description: "ShortDescription2", long_description: "LongDescription2", categories: ["CategoryId1"]},
                {id: "ViewId3", name: "CategoryView3", short_description: "ShortDescription3", long_description: "LongDescription3", categories: ["CategoryId3", "CategoryId4"]}
            ]
        }).as('getCategoryViews');
        cy.intercept('GET', '/categories', {statusCode: 200, body : [
                {id: "CategoryId1", name: "Category1", description: "Description1", techniques: ["TechniqueId1", "TechniqueId2"]},
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
        cy.wait('@getCategoryViews');
        cy.wait('@getCategories');
        cy.wait('@getTechniques');
    });

    // Test 1
    it('Should show dropdown of search options when typing in the search bar something that exists', () => {
      cy.get('input').type('category');

      cy.get('ul.search-dropdown').should('contain.text', 'CategoryId1: Category1')
      .and('contain.text', 'CategoryId2: Category2');
    });

    // Test 2
    it('Should not show dropdown of search options when typing something in the search bar that does not exist', () => {
      cy.get('input').type('category3');

      cy.get('ul.search-dropdown').should('not.exist');
    });

    // Test 3
    it('Should go to detailpage of category1 when clicked on dropdown item with category1', () => {
      cy.get('input').type('category1');

      cy.intercept('GET', '/categories?categoryId=CategoryId1', {statusCode: 200, body :{
          id: "CategoryId1", name: "Category1", description: "Description1", techniques: ["TechniqueId1", "TechniqueId2"]
        }
      }).as('getCategory');
      cy.intercept('GET', '/techniques?techniqueId=TechniqueId1', {statusCode: 200, body : {
          id: "TechniqueId1", name: "Technique1", description: "Description1", synonyms: ["Synonym1", "Synonym2"], details: "Details1", subtechniques: ["TechniqueId1"], examples: ["Example1", "Example2"], weaknesses: ["WeaknessId1"], CASE_output_classes: ["Class1"], references: ["Reference1", "Reference2"]
        }
      }).as('getTechnique1');
      cy.intercept('GET', '/techniques?techniqueId=TechniqueId2', {statusCode: 200, body : {
          id: "TechniqueId2", name: "Technique2", description: "Description2", synonyms: ["Synonym1", "Synonym2"], details: "Details2", subtechniques: ["TechniqueId1"], examples: ["Example1", "Example2"], weaknesses: ["WeaknessId1"], CASE_output_classes: ["Class1"], references: ["Reference1", "Reference2"]
        }
      }).as('getTechnique2');

      cy.contains('Category1').click();

      cy.wait('@getCategory');
      cy.wait('@getTechnique1');
      cy.wait('@getTechnique2');

      cy.url().should('include', 'categories/CategoryId1');
      cy.get('p.page-path').should('contain.text', 'CategoryId1: Category1');
    });
})