describe('using the homepage', () => {

    beforeEach(() => {
        
        // Intercepts
        cy.intercept('GET', '/categoryViews', {statusCode: 200, body : [
                {id: "ViewId1", name: "CategoryView1", short_description: "ShortDescription1", long_description: "LongDescription1", categories: ["CategoryId1", "CategoryId2"]},
                {id: "ViewId2", name: "CategoryView2", short_description: "ShortDescription2", long_description: "LongDescription2", categories: ["CategoryId1"]},
                {id: "ViewId3", name: "CategoryView3", short_description: "ShortDescription3", long_description: "LongDescription3", categories: ["CategoryId3", "CategoryId4"]}
            ]
        }).as('getCategoryViews');
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
        cy.wait('@getCategoryViews');
        cy.wait('@getCategories');
        cy.wait('@getTechniques');
    });

    // Test 1
    it('Should show dropdown menu for selecting the view when the homepage loads', () => {

        cy.get('select.selection').should('exist');

        const expectedOptions = [
            'CategoryView1: ShortDescription1',
            'CategoryView2: ShortDescription2',
            'CategoryView3: ShortDescription3'
        ]

        cy.get('select.selection option').should('have.length', 4);

        cy.get('select.selection').should('contain.text', expectedOptions[0]).and('contain.text', expectedOptions[1]);
    });

    // Test 2
    it('Should go to the aboutpage when link to aboutpage is clicked', () => {

        cy.contains('About page').click();

        cy.url().should('include', '/about')
    });

    // Test 3
    it('Should update categories and techniques when the user selects a view', () => {
        cy.get('select.selection').select('CategoryView1: ShortDescription1');
        
        cy.get('body').should('contain.text', 'LongDescription1')
        .and('contain.text', 'Category1')
        .and('contain.text', 'Techniques: 1')
        .and('contain.text', 'Technique1 (1)');
    });

    // Test 4
    it('Should go to detailpage of technique1 when clicked on link for technique1', () => {
        cy.get('select.selection').select('CategoryView1: ShortDescription1');

        cy.intercept('GET', '/techniques?techniqueId=TechniqueId1', {statusCode: 200, body : {
                id: "TechniqueId1", name: "Technique1", description: "Description1", synonyms: ["Synonym1", "Synonym2"], details: "Details1", subtechniques: ["TechniqueId1"], examples: ["Example1", "Example2"], weaknesses: ["WeaknessId1"], CASE_output_classes: ["Class1"], references: ["Reference1", "Reference2"]
            }
        }).as('getTechnique');
        cy.intercept('GET', '/weaknesses?weaknessId=WeaknessId1', {statusCode: 200, body : {
            id: "WeaknessId1", name: "Weakness1", details: "Details1", risks: ["Risk1", "Risk2"], mitigations: ["MitigationId1"], references: ["Reference1", "Reference2"]
        }
        }).as('getWeakness');

        cy.contains('Technique1').click();

        cy.wait('@getTechnique');
        cy.wait('@getWeakness');

        cy.url().should('include', 'techniques/TechniqueId1');
        cy.get('p.page-path').should('contain.text', 'CategoryView1 > CategoryId1: Category1 > TechniqueId1: Technique1');
    });

    // Test 5
    it('Should display excluded techniques only in the excluded section when a view is selected', () => {
        cy.get('select.selection').select('CategoryView2: ShortDescription2');

        cy.contains('(Show)').click();

        cy.get('p.missing-warning').should('contain.text', 'This overview is missing the following techniques:');
        cy.get('div.missing-section').should('contain.text', 'TechniqueId2: Technique2');
    });

    // Test 6
    it('Should not display the excluded techniques section when none exist for the selected view', () => {
        cy.get('select.selection').select('CategoryView1: ShortDescription1');

        cy.get('p.missing-warning').should('not.exist');
    });

    // Test 7
    it('Should show no categories message when no categories are found for the view', () => {
        cy.get('select.selection').select('CategoryView3: ShortDescription3');

        cy.get('body').should('contain.text', 'No categories found.');
    });
});