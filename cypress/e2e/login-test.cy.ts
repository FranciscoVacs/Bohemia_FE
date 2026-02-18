describe('login test', () => {

  beforeEach(() => {
    cy.visit('http://localhost:4200')

  })
  it('opens and completes login modal', () => {

    cy.get('[data-cy=login-button]').click();

    cy.get('#login-email').type('admin1@gmail.com');
    cy.get('#login-password').type('Admin123');

    cy.get('[data-cy=visibility-button]').click();
    cy.contains('Ingresar').click();

    cy.contains('Admin Panel').should('be.visible')
  })

  it('logs in, navigates to Admin Panel and creates a new event', () => {
    // --- Login ---
    cy.get('[data-cy=login-button]').click();
    cy.get('#login-email').type('admin1@gmail.com');
    cy.get('#login-password').type('Admin123');
    cy.get('[data-cy=visibility-button]').click();
    cy.contains('Ingresar').click();

    // Assert Admin Panel link is visible after login
    cy.get('[data-cy=admin-panel-link]').should('be.visible');

    // --- Navigate to Admin Panel ---
    cy.get('[data-cy=admin-panel-link]').click();

    // Assert we are on the event management page
    cy.contains('Gestión de Eventos').should('be.visible');
    cy.get('[data-cy=create-event-link]').should('be.visible');

    // --- Go to Create Event form (Step 1) ---
    cy.get('[data-cy=create-event-link]').click();

    // Assert Step 1 heading and form are visible
    cy.contains('NUEVO').should('be.visible');
    cy.get('[data-cy=event-name-input]').should('be.visible');

    // --- Fill in Step 1: General Info ---
    cy.get('[data-cy=event-name-input]')
      .type('Bohemia Rosario - Edición Otoño 2026');
    cy.get('[data-cy=event-name-input]')
      .should('have.value', 'Bohemia Rosario - Edición Otoño 2026');

    cy.get('[data-cy=event-description-textarea]')
      .type('Una noche de música electrónica con los mejores DJs de la escena local. Dress code: all black.');
    cy.get('[data-cy=event-description-textarea]')
      .should('not.have.value', '');

    cy.get('[data-cy=event-min-age-select]').select('18');
    cy.get('[data-cy=event-min-age-select]').should('have.value', '18');

    // --- Fill in Step 1: Date & Time ---
    cy.get('[data-cy=event-begin-date-input]').type('2026-03-15');
    cy.get('[data-cy=event-begin-date-input]').should('have.value', '2026-03-15');

    cy.get('[data-cy=event-begin-time-input]').type('22:00');
    cy.get('[data-cy=event-begin-time-input]').should('have.value', '22:00');

    cy.get('[data-cy=event-finish-date-input]').type('2026-03-16');
    cy.get('[data-cy=event-finish-date-input]').should('have.value', '2026-03-16');

    cy.get('[data-cy=event-finish-time-input]').type('06:00');
    cy.get('[data-cy=event-finish-time-input]').should('have.value', '06:00');

    // --- Fill in Step 1: Location (select first available city and location) ---
    cy.get('[data-cy=event-city-select]').find('option').not('[value=""]').first().then(($option) => {
      cy.get('[data-cy=event-city-select]').select($option.val() as string);
    });
    cy.get('[data-cy=event-city-select]').should('not.have.value', '');

    cy.get('[data-cy=event-location-select]').find('option').not('[value=""]').first().then(($option) => {
      cy.get('[data-cy=event-location-select]').select($option.val() as string);
    });
    cy.get('[data-cy=event-location-select]').should('not.have.value', '');

    // --- Fill in Step 1: DJ ---
    cy.get('[data-cy=event-dj-select]').find('option').not('[value=""]').first().then(($option) => {
      cy.get('[data-cy=event-dj-select]').select($option.val() as string);
    });
    cy.get('[data-cy=event-dj-select]').should('not.have.value', '');

    // --- Upload cover image (Multimedia section) ---
    cy.get('[data-cy=event-cover-image-input]').selectFile('cypress/fixtures/party.png', { force: true });

    // --- Proceed to Step 2 ---
    cy.get('[data-cy=event-next-step-button]').should('be.visible');
    cy.get('[data-cy=event-next-step-button]').click();

    // Assert Step 2 is loaded
    cy.contains('PASO 2 DE 2').should('be.visible');
    cy.get('[data-cy=new-ticket-button]').should('be.visible');

    // --- Add a ticket type ---
    cy.get('[data-cy=new-ticket-button]').click();

    cy.get('[data-cy=ticket-name-input]').should('be.visible');
    cy.get('[data-cy=ticket-name-input]').type('General Early Bird');
    cy.get('[data-cy=ticket-name-input]').should('have.value', 'General Early Bird');

    cy.get('[data-cy=ticket-price-input]').clear().type('3500');
    cy.get('[data-cy=ticket-price-input]').should('have.value', '3500');

    cy.get('[data-cy=ticket-stock-input]').clear().type('20');
    cy.get('[data-cy=ticket-stock-input]').should('have.value', '20');

    cy.get('[data-cy=ticket-sort-order-input]').clear().type('1');
    cy.get('[data-cy=ticket-sort-order-input]').should('have.value', '1');

    cy.get('[data-cy=add-ticket-submit-button]').click();

    // Assert the publish button is now enabled (ticket was added)
    cy.get('[data-cy=publish-event-button]').should('be.visible');
    cy.get('[data-cy=publish-event-button]').should('not.be.disabled');

    // --- Publish the event ---
    cy.get('[data-cy=publish-event-button]').click();

    // Assert the publish confirmation modal appeared
    cy.contains('Publicar evento?').should('be.visible');
    cy.get('[data-cy=confirm-publish-button]').should('be.visible');
    cy.get('[data-cy=confirm-publish-button]').click();

    // Assert we are redirected back to the event management page after publishing
    cy.contains('Gestión de Eventos').should('be.visible');

    // Assert the new event has been created
    cy.contains('Bohemia Rosario - Edición Otoño 2026')
      .should('exist');
  })
})