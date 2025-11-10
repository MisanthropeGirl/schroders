# Schroder's technical test

My solution may not have gotten me a second interview but I can use this exercise as playground for learning new tools etc. The plan is, starting with Redux, to go about integrating various state management libraries in to the application and then write thorough tests to go with. If it fits, I shall also look at adding Next.js. If I bash my head for long enough against Google (other search engines are available) without managing to figure things out I'll even resort to seeing if a LLM can be of assistence.

This is not a read me in the traditional sense but rather a diary of thngs I learnt/fought with along the way.

## 2025-10-04

Added old school style Redux (aka what I know thanks to my time at F1000). This is the first time I've done this from scratch (Helen S, Goran N and Igor T did this work for F1000) so it was all about seeing if I actually understood what I thought I did from that time.

Bit of a faff (some of which was removing the prop-drilling I had initially gone with). I have set an initial state for several parameters which I believe makes sense in the circumstances.

The biggest fight I had was with getting Redux DevTools to acknowledge the store. AIUI the lack of middleware in the store in this iteration is the reason for this which is why I've had to [explicitly link them up](https://github.com/zalmoxisus/redux-devtools-extension/blob/master/docs/Recipes.md#using-in-a-typescript-project).

## 2025-10-10

Started to add tests and today was all about index.tsx. Some comments I read online suggested skipping this as it is a trivial file and whilst I'm ordinarily in favour of the path of least resistence, I felt it was important, if only for the sake of completeness, for me to get this file tested as well. Cue a day of pain.

Not knowing where to start, I took the sensible course and went looking to see [how others](https://stackoverflow.com/questions/43044696/test-a-create-react-app-index-js-file) have [gone about it](https://joaoforja.com/blog/how-to-test-a-rect-app-indexjs).

### First iteration

OK, I have a working app so implementing a basic test like the one below shouldn't be a problem, right? Oh, how young and innocent I was just 24 hours ago.

```
import React from "react";
import ReactDOM from "react-dom";
import App from "./App";

jest.mock("react-dom", () => ({ render: jest.fn() }));

describe("Application root", () => {
  it("should render without crashing", () => {
    const div = document.createElement("div");
    div.id = "root";
    document.body.appendChild(div);
    require("./index.js");
    expect(ReactDOM.render).toHaveBeenCalledWith(<App />, div);
  });
});
```

There are two issues

1. VSCode flags a TypeScript error: `TS2339: Property 'render' does not exist on type 'typeof import("/Users/MisanthropeGirl/Websites/interviews/schroders/node_modules/@types/react-dom/index")'`.
2. `TypeError: tk.CSS?.supports is not a function` on StockChart.tsx (which is the Highcharts import).

Not having any luck on Google I turned to Claude (Sonnet 4.5) for help.

The first error is because I'm using React 19 and `ReactDOM.render` was removed in React 18. The suggested solution was:

```
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

jest.mock("react-dom/client", () => ({
  createRoot: jest.fn(() => ({
    render: jest.fn(),
    unmount: jest.fn(),
  })),
}));

describe("Application root", () => {
  it("should render without crashing", () => {
    const div = document.createElement("div");
    div.id = "root";
    document.body.appendChild(div);

    require("./index.tsx");

    expect(createRoot).toHaveBeenCalledWith(div);
  });
});
```

Key Changes:

1. Import from react-dom/client instead of react-dom
2. Mock createRoot instead of render
3. createRoot returns an object with render and unmount methods
4. Update the expectation to check that createRoot was called with the div

And that cured problem number 1.

### Second iteration

This was a sticking point for a bit because I only gave Claude the error and not the full stack trace leading it to diagnose the issue as something to do with `CSS.supports()` and the lack of support for that browser API in my test environment. A very real concern given that I can only go as far as Node.js v16 on this machine.

Cue several hours of chasing our tails trying to modify parts of the setup - creating `jest.config.js` and `jest.setup.ts`, installing jsdom v22 - to see if that solved the problem before I came to my senses and gave Claude the full stack trace.

The problem, as is obvious once you know, is that `require("./index.tsx")` loads all the components including StockChart.tsx, which imports Highcharts, and Highcharts needs `CSS.supports()` to be available at module load time - which is before Jest setup runs.

The suggested solution therefore was to mock Highcharts since I don't actually need it to test the file.

```
import React from "react";
import { createRoot } from "react-dom/client";
import "@testing-library/jest-dom";

jest.mock("react-dom/client", () => ({
  createRoot: jest.fn(() => ({
    render: jest.fn(),
    unmount: jest.fn(),
  })),
}));

// Mock Highcharts before importing App
jest.mock("highcharts", () => ({}));
jest.mock("highcharts-react-official", () => ({
  HighchartsReact: () => null,
}));

// Mock Redux store
jest.mock("./store", () => ({
  store: {
    getState: jest.fn(),
    dispatch: jest.fn(),
    subscribe: jest.fn(),
  },
}));

import App from "./App";

describe("Application root", () => {
  it("should render without crashing", () => {
    const div = document.createElement("div");
    div.id = "root";
    document.body.appendChild(div);

    require("./index.tsx");

    expect(createRoot).toHaveBeenCalledWith(div);
  });
});
```

Which, whilst dealing with the Highcharts problem, still threw an error: `TypeError: Cannot read properties of undefined (reading 'render')`;

### Third iteration

Claude said that this was still because of `index.tsx` loading things too early, in this case `createRoot` before the mock takes effect. The given solution was thus to mock everything before any imports:

```
import React from "react";
import "@testing-library/jest-dom";

// Mock everything BEFORE any imports that use them
jest.mock("highcharts", () => ({}));
jest.mock("highcharts-react-official", () => ({
  HighchartsReact: () => null,
}));

jest.mock("./store", () => ({
  store: {
    getState: jest.fn(),
    dispatch: jest.fn(),
    subscribe: jest.fn(),
  },
}));

const mockRender = jest.fn();
const mockCreateRoot = jest.fn(() => ({
  render: mockRender,
  unmount: jest.fn(),
}));

jest.mock("react-dom/client", () => ({
  createRoot: mockCreateRoot,
}));

describe("Application root", () => {
  it("should render without crashing", () => {
    const div = document.createElement("div");
    div.id = "root";
    document.body.appendChild(div);

    // Clear any previous calls
    mockCreateRoot.mockClear();
    mockRender.mockClear();

    // Now require index.tsx which will use the mocked createRoot
    require("./index.tsx");

    expect(mockCreateRoot).toHaveBeenCalledWith(div);
    expect(mockRender).toHaveBeenCalled();
  });
});
```

Key changes:

1. Removed the import of createRoot at the top since you're mocking it
2. Created mockRender and mockCreateRoot before the mock so you can reference them in your assertions
3. Clear mocks before the test to ensure clean state
4. Check that mockRender was called instead of checking the arguments to createRoot

However I still had the same error so back to the drawing board.

### Fourth iteration

This time Claude suggested testing the rendering logic directly since there may be caching or the mock just isn't be applied correctly. It is also using `jest.isolateModules()` to ensure that `index.tsx` is loaded fresh and uses ths mocks.

```
import React from "react";
import "@testing-library/jest-dom";
import { createRoot } from "react-dom/client";

// Mock everything BEFORE imports
jest.mock("highcharts", () => ({}));
jest.mock("highcharts-react-official", () => ({
  HighchartsReact: () => null,
}));

jest.mock("./store", () => ({
  store: {
    getState: jest.fn(() => ({})),
    dispatch: jest.fn(),
    subscribe: jest.fn(),
    replaceReducer: jest.fn(),
  },
}));

jest.mock("./reportWebVitals", () => jest.fn());

const mockRender = jest.fn();
const mockUnmount = jest.fn();

jest.mock("react-dom/client", () => ({
  createRoot: jest.fn(() => ({
    render: mockRender,
    unmount: mockUnmount,
  })),
}));

describe("Application root", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Create root element
    const root = document.createElement("div");
    root.id = "root";
    document.body.appendChild(root);
  });

  afterEach(() => {
    // Clean up
    document.body.innerHTML = "";
  });

  it("should render without crashing", () => {
    // Manually execute what index.tsx does
    const rootElement = document.getElementById("root") as HTMLElement;

    // Import and execute
    jest.isolateModules(() => {
      require("./index.tsx");
    });

    expect(createRoot).toHaveBeenCalledWith(rootElement);
    expect(mockRender).toHaveBeenCalled();
  });
});
```

But that didn't do the job either.

### Fifth (and final) iteration

The final suggestion was to strip things all the way back and just check that the `App` component can be imported and created. It worked (see `index.test.tsx`).

This is though a smoke test rather than a unit test so when I look at the coverage it still says that there is no test coverage.

For the sake of my own sanity I also spun up a default `create-react-app` installation and tested to see if the online suggestions I found actually worked with that. None of them did so either React 19 really screws with the examples I found or it is down to my ancient version of Node. One, perhaps, to revisit as and when I buy a new computer.

## 2025-10-15

Writing tests for actions, reducers and selectors was straight forward once I'd engaged the brain cell for half a second. No need to write any for constants as there are no functions there.

The coverage report says that `store.ts:14` is uncovered but since this is the line which hooks in to Redux DevTools I shall ignore it.

## 2025-10-16

Mocking the `dataFetch` function so I can unit test it. Apparently I can do this [without using mock service workers](https://www.codementor.io/@chihebnabil/complete-guide-to-mocking-fetch-in-jest-2lejnjl4bs) but at this stage I don't know what I'm losing (integration tests, perhaps?) by not using them. One for the future once I've finished unit testing.

Got a bit hung up trying to figure out the fail path (`utilities/index.ts:7`) so asked Claude and then asked it to run an eye over what I'd done over the last couple of days.

Ignoring the occasional 'no need to test this, it is trivial' _cough_ actions _cough_ the helpful feedback was:

1. Utilities: What if the JSON response is invalid?
2. Reducers: What if the action doesn't match any of the options?
3. Reducers: What if the state is undefined?
4. Reducesr: Edge cases such as duplicate tickers and persistence of [new|removed]Ticker.
5. Selectors: Null/undefined state handling
6. Selectors: Empty selectedTickers

Tests added for everything but 4. Duplicates won't happen as the reducer adds or removes a ticker based on its presence or otherwise within the array. Not bothered by the persistence issue at this time.

Claude also suggested some refactoring to reduce code repetition in the tests for actions and selectors.

## 2025-10-22

Added some error checking for the dates. Although min and max values have been set the MUI TextField allows users to breach these. Have I missed something in configuration or should I have used a lower level component, i.e. Input, rather than the wrapper?

Added basic 'does it render without crashing tests' for each component and started on testing `ChartOptions`. Have tested the rendering and initialisation of the fields but can't figure out how to test the change event handlers (aside from the error conditions in the date one - albeit that testing to date is before from date is throwing an error despite my copying the code from the reverse test).

## 2025-10-28

Realised that my error checking for the dates wasn't good enough so I rewrote it and the tests. Spent a lot of time trying to test the dispatching of the action for the price option change with the help of Claude but eventually gave up since I couldn't simulate the dispatch tself so stuck to testing the behaviour and the outcome. `--coverage` says 100% so hopefully I've covered everything.

Started out using `fireEvent` to simulate the user interactions but was pointed at `userEvent` instead. I understand that this is the better way of emulating them but trying to update inputs with `.type()` (or at least date inputs) requires clearing the input first - although that may just be because of Material UI.

## 2025-10-29

Wrote the tests for `App.tsx` and `StockList.tsx` today. For the former just checking that it renders was enough for full coverage and that worked fine once I'd mocked Highcharts.

All the happy path behavioural tests for the latter were easy enough, even discovering how to wait for an elemnt to show up, i.e. the loading message being replaced by the table, except that I wasn't mocking `dataFetch` so was hitting the live API - which isn't particularly sensible. This was resolved once I started, with Claude's help, to test the not so happy path. (I'd been looking at the [Mock Functions](https://jestjs.io/docs/mock-functions]) part of the Jest documentation but couldn't see how to make the examples there work for what I wanted and I wasn't going to be finding `jest.spyOn` in a month of Sundays.) With what that told me I could go back and add mocking to the happy path test cases as well.

The only line which I have been unable to test fully is line 56 as I can't fake the component in to having enabled checkboxes when the selectedTickers has three items. I did though try and the mock store was updated to include the ability to accept an initial state as a parameter. I could simply delete the offending if statement but it feels like a necessary piece of error checking just in case someone manages to get around Material UI's checkbox disabling.

## 2025-10-30

Wrote the tests for `stockChart.tsx`. Mostly straightforward - except for when I removed the if statements in the `useEffect` hooks for `newTicker` and `removedTicker` when it all went to pot so I restored them - and I didn't have to ask Claude anything so perhaps some of what I've been doing is starting to sink in. The ability to pass an initial state to the store came in handy for a couple of today's tests. Line 36 (where any previous data for a ticker is removed) is untested but I can't see how that can be tested.

Moved the `dataTransform` function to `utilities.tsx` so I could test it in isolation.

If I exclude the files added when I was using mock service workers and `reportWebVitals.ts` then overall test coverage is close to 100%. Even with them in it is over 90%. It's mainly the lack of testing for `index.tsx` (see above) which is dragging it down so I'm going to declare myself satisifed wth my efforts. I may tomorrow though run everything through Claude and ask it to point out any potential improvements. After that, it is time to see what integration and end-to-end testing can potentially be applied.

## 2025-11-01

I have now run the tests for the components and utilities past Claude with the prompt of "What am I missing? What could I do better?" and incorporated much (but not all) of the feedback.

Relevant feedback for each was as follows;

### `utilities.ts`

1. Handle special cases in `convertObjectToString`. I'm not URL-encoding values as the API documentation didn't mention it.
2. Handle an empty array being passed to `dataTransform`.
3. Checking that the object parameters passed to `dataFetch` are in the queryString.

### `ChartOptions.tsx`

1. Testing the happy path thoroughly. No tests for successful `fromDate` and `toDate` changes or for when one date is initially invalid but becomes valid when the second date changes.
2. Edge case around equal dates
3. Radio button accessibility

### `StockList.tsx`

1. Avoiding repetition
2. Unchecking a checkbox
3. Magic numbers
4. Radio button accessibility
5. Currency potentially missing in the API output

As well as suggesting tests for the defensive coding of line 56 and dealing with some data persistence between tests.

### `StockChart.tsx`

1. Hadn't tested that things work correctly when the date range or the price option change. Doing the former took care testing line 36 (obvious really).
2. More testing around adding and removing tickers, including adding 2 or more.
3. Handing the if statements around the `newTicker` and `removedTicker` actions.

## 2025-11-05

Did some reading around integration testing, eventually realising that what the various writers were describing I had been doing when I was writing the tests for the components. I can live with that. Time to move on to looking at end to end testing then. AIUI that'll be using either 'Selenium' or 'Cypress' but we'll see what some reading throws up.

Eliminated the `act()` errors. For `StockList.test.tsx` this involved merging the first three tests in to one (something which made sense anyway) and for `StockChart.test.tsx` wrapping all of the `store.dispatch()` calls in an `act(() => {})` call.

# 2025-11-07

I'd forgotten about playwright. OK, that's not quite true; I hadn't twigged it was an end to end testing library. I've therefore installed it (v1.48.2 because of the MacOS version on this MacBook and the limitations of my of node.js version) and shall proceed to read the docs. `npx playwright install` gave me problems for a bit because it wouldn't install WebKit (again, machine age related) but `npx playwright install [firefox|chromium]` got around that.

## 2025-11-08

I may have spoken too soon. I changed the tests in the example to be a single one which checked for 'schroders' in the page title and it still failed when I ran it. I either need an earlier version (no idea which) or to stopping fannying around and buy myself a new computer.

## 2025-11-10 (AM)

Since the playwright setup includes GitHub actions I thought I might commit this single test, push it and see what happens. If this doesn't work then I'll uninstall playwright and come back to it at a later time.

Update: It didn't work. The GitHub action complained about redux and its dependencies. Another push to get me to buy a new machine!

## 2025-11-14

I was supposed to be seeing about switching out the redux approach I've been using for the newer way of doing it via ReduxToolkit but I finally figured out how to eliminate `newTicker` and `removeTicker`. I didn't like that I had three pieces of state to manage the tickers when only one should have been necessary but couldn't see how to do it.

My changes resulted a flaw which only become evident when I ran the test suite, viz two of the `useEffect`'s were fired when `selectedTickers` was pre-populated. Not that I could see what the reason was but Claude could and it proposed the adopted solution.

I can also, as a result of this refactoring, eliminate the final useEffect and move that logic in to first one.

## 2025-11-20

Realised that what I thought was an intermittent issue with changing the dates was actually replicable every time. In summary, when there are multiple tickers and the date range is changed only one of the tickers reflects the new date range in the chart. Doing some digging confirms that all of the API calls are being made but that there would appear to be a race condition going on when it comes to updating the state, i.e. the second and subsequent API calls are being triggered before the state update for the previous one has finished so old data is being used when the data array is being mutated (via a shallow copy).

Not seeing any way around this using standard react (unless I wanted to use a timeout in the loop), I installed the `use-immer` library/hook so I could manipulate the state and solve the issue.

Testing this took a while as the test never ran `setData`. After a bit of back and forth with Claude (it took a while for it to catch up) it told me that this was because the test was completing before `setData` was executed and suggested adding a timeout just to give the test the necessary time. Whilst that worked, I am not a fan of timeouts so asked for a better solution and got

```
// Flush all pending promises and state updates
await act(async () => {
  await Promise.resolve();
});
```

which also worked so I'll go with that instead.

## 2025-12-17

Figured, after my travails with testing ReactToolkit, that it was time to look at mock service workers using [mswjs]](https://mswjs.io/). Deciding to ease myself in gently I went back to the version of this project which uses old skool redux. I then made the fatal mistake of installing v2 and found myself in configuration hell.

It all started so well with updating the `handlers.ts` and `server.ts` files to match what was in the quick setup guide and then adding the following to `jest.setup.ts`:

```
import { server } from "./mocks/server";

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

So far, so simple. So far, so wrong.

I ended up installing a host of other packages, including but not limited to: `ts-node`, `ts-jest`, `jest` (explicitly so even though is already there via ` create-react-app`), `jest-environment-jsdom` and `jest-fixed-jsdom` with a `jest.config.ts` file (referenced in `package.json` as `"test": "react-scripts test --config jest.config.js"`) something like this

```
import type { Config } from "jest";
import { createDefaultPreset } from 'ts-jest'

const config: Config = {
  ...createDefaultPreset(),
  transform: {
    "^.+\\.(t)s$": "ts-jest",
    "^.+\\.(js|jsx)$": "babel-jest",
  },
  collectCoverage: true,
  collectCoverageFrom: ["src/**/*.{ts,tsx}"],
  coverageDirectory: "coverage",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testEnvironment: "jest-fixed-jsdom"
};

export default config;
```

before I gave up and started over.

Keeping the updated files and the updated `msw` package, I tried to include my jest setup file via `setupTest.ts`, viz:

```
import "@testing-library/jest-dom";
{
  "setupFilesAfterEnv": ["<rootDir>/src/jest.config.js"]
}
```

but that got me nowhere. Claude told me this was wrong and to move what I had in my setup file in to `setupTests.ts`. Which moved me on to this error:

```
Test suite failed to run
ReferenceError: TextEncoder is not defined
```

I had seen a [solution](https://mswjs.io/docs/migrations/1.x-to-2.x#requestresponsetextencoder-is-not-defined-jest) earlier in the day when I was falling down a rabbit hold of dependencies but didn't recall it so Claude and I ended up in a merry go around of trying to polyfill `TextEncoder` without getting anywhere before realising that the latest version of `msw` was to blame (which it was) and that I should go back to using v1. I did, once I'd found that aforementioned solution again, try to do that but I once again ended up in dependency hell so gave up. One to come back to as and when I hit 'eject' on `create-react-app`.

## 2025-12-18

With the setup in place moving from using Jest to MSW was generally simply (we'll ignore the hour or so I wasted chasing my tail thanks to code blindness). What I learnt:

1. MSW for HTTP interactions/network requests, Jest for everything else. Simple enough but I spent some time trying to figure out how to test a non-network error before I was disabused of the idea.
2. I [shouldn't do assertion tests](https://mswjs.io/docs/best-practices/avoid-request-assertions/) like `expect(url).toHaveBeenLastCalledWith()` on intercepted requests.

## 2025-11-10 (PM)

*Dates are out of order as everything from this point onwards is the branch rather than the base*

Now that the basics are all in place (playwright excepted), it's time to look at changing it using various other available tools. First up, it's replacing the use of `fetch` with `axios`.

The documentation made this a fairly straightforward exercise in respect of my `dataFetch` function. Testing it, unsurprisingly, was a bit more difficult.

I'd figured that I probably had to import the library in to the test file and mock it but when the suite then ran I got a `Cannot use import statement outside a module` error which baffled me since I was importing it. After triple checking that I wasn't going mad, I put it through Google and found that I had to [add the following](https://stackoverflow.com/a/74297004) to my `package.json` file:

```
  "jest": {
    "moduleNameMapper": {
      "^axios$": "axios/dist/node/axios.cjs"
    }
  },
```

Supposedly I can also add it to my `jest.config.ts` and then reference it in `package.json` as `"jest": "/path/to/jest.config.ts"` but when I tried that I was told I need to run `npm eject` first. Not knowing what the command would do I looked it up first and discovered that it would break this app out of the `create-react-app` wrapping. Something for another day, I think.

Import accomplished I then had to mock it. I figured this would be similar to what I have for `highcharts` so initially went with `jest.mock("axios", () => ({}));` whilst replacing `global.fetch = jest.fn().mockResolvedValue()` with `axios = jest.fn().mockResolvedValue()` but that didn't get me very far so back to [Google](https://stackoverflow.com/a/69579639):

```
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;
```

The top line has to be at the same level of the import but the second one is quite happy within the block of tests relating to `dataFetch`.

Thus `axios = jest.fn().mockResolvedValue()` become `mockedValue.get.mockResolvedValue()` but resulted in the output being undefined rather than the mocked result I was expecting.

It turned out that the 'mistake' was using `axios(url)` rather than `axious.get(url)` in the `dataFetch`. Not that I could see that but Claude told me that I was being a muppet. It suggested some changes to the tests but the simpler change was to update `dataFetch`.

After that all of the happy path tests fell in to place but a couple of the fail path ones needed a bit more tweaking.

Since `axios` will take any parameters as an object I no longer need to stringify them myself so I can remove the `convertObjectToString` function and everything associated with it.
