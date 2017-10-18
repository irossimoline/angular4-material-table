import { AngularMaterialTablePage } from './app.po';

describe('angular-material-table App', () => {
  let page: AngularMaterialTablePage;

  beforeEach(() => {
    page = new AngularMaterialTablePage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!!');
  });
});
