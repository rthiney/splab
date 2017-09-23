import { browser, by, element } from 'protractor';

class HomeObj {
    public title: any;
    constructor() {
        this.title = element(by.id('body'));
    }
}

describe('App', () => {

    beforeEach(() => {
        browser.get('/');
    });

    const home: HomeObj = new HomeObj();

    it('Should be defined', () => {
        expect(home).toBeDefined();
    });
});
