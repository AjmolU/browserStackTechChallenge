const { Builder, By, Key, until, Capabilities } = require("selenium-webdriver");
require('dotenv').config();

describe("Invite users test", () => {
  let driver;
  const email = process.env.EMAIL;
  const password = process.env.PASSWORD;

  beforeAll(() => {
    driver = new Builder()
      .usingServer(`http://localhost:4444/wd/hub`)
      .withCapabilities(Capabilities.chrome())
      .build();
  });
  
  afterAll(async () => {
    await driver.quit();
  })

  test("login test", async () => {
    await driver.get("https://www.browserstack.com");
    await driver.wait(until.titleMatches(/BrowserStack/i), 10000);

    const windowSize = await driver.executeScript('return [window.innerWidth, window.innerHeight];');
    const windowWidth = windowSize[0];

    if (windowWidth < 980) {
        await driver.findElement(By.id("primary-menu-toggle")).click();
    }

    await driver.wait(until.elementLocated(By.css(".bstack-mm-main-link-sign-in")));
    try {
      // Wait for the overlapping element to disappear if it exists
      await driver.wait(until.elementIsNotVisible(driver.findElement(By.css("._vis_hide_layer"))), 10000);
    } catch (e) {
      // If the element is not found, proceed without error
      if (e.name !== 'NoSuchElementError') {
        throw e;
      }
    }

    await driver.findElement(By.css(".bstack-mm-main-link-sign-in")).click();
    
    await driver.wait(until.urlContains("/sign_in"), 10000);
    await driver.wait(until.elementLocated(By.id("user_email_login")));

    await driver.findElement(By.id("user_email_login")).sendKeys(email);
    await driver
    .findElement(By.id("user_password"))
    .sendKeys(password, Key.ENTER);
    await driver.wait(until.urlContains("/dashboard"), 10000);

    expect(await driver.getCurrentUrl()).toContain("/dashboard");

    let currentUrl = await driver.getCurrentUrl();
    if (windowWidth < 980 && !currentUrl.includes("live")) {
        await driver.findElement(By.id("primary-menu-toggle")).click();
    }
    
    await driver.wait(until.elementLocated(By.id("invite-link")));
    // Assert that the homepage includes a link to invite users
    const inviteLinkElement = await driver.findElement(By.id("invite-link"));
    expect(inviteLinkElement).toBeDefined();
    await inviteLinkElement.click();
    const copyInvitationLinkElement = await driver.findElement(By.css('[aria-label="copy invitation link"]')) || await driver.findElement(By.css('.invite-modal__button--secondary'));
    await driver.executeScript("arguments[0].click();", copyInvitationLinkElement);

    // Retrieve the link’s URL
    const inviteTextElement = await driver.findElement(By.css(".manage-users__invite-copyLink-text")) || await driver.findElement(By.css(".invite-modal__copy_text"));
    const inviteText = await inviteTextElement.getText();

    currentUrl = await driver.getCurrentUrl();
    if (windowWidth < 980 && !currentUrl.includes("live")) {
        await driver.findElement(By.id("primary-menu-toggle")).click();
        const signOutLinkElement = await driver.findElement(By.css(".sign_out_link"));
        await driver.executeScript("arguments[0].click();", signOutLinkElement);
    } else {
        await driver.findElement(By.id("account-menu-toggle")).click();
        await driver.findElement(By.id("sign_out_link")).click();
    }
    
    expect(await driver.getCurrentUrl()).toContain("/automate");

    // Assert retrieved URL links to the correct page
    await driver.get(inviteText);
    await driver.wait(until.urlContains("/users/sign_in?token"), 10000);
    expect(await driver.getCurrentUrl()).toContain("/users/sign_in?token");

  }, 1000000);

});