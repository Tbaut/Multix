export const notifications = {
  successNotificationIcon: () => cy.get('[data-cy=notification-icon-success]'),
  errorNotificationIcon: () => cy.get('[data-cy=notification-icon-error]'),
  loadingNotificationIcon: () => cy.get('[data-cy=notification-icon-loading]', { timeout: 20000 }),
  notificationWrapper: () => cy.get('[data-cy=notification-wrapper]')
}
