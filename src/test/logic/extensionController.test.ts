import * as vscode from "vscode";
import { assert, expect } from "chai";
import * as sinon from "sinon";
import ExtensionController from "../../ExtensionController";
import Item from "../../interfaces/item";
import ItemType from "../../enums/itemType";
import QuickPickExtendedItem from "../../interfaces/quickPickExtendedItem";
import * as utils from "../../utils";
import { config } from "../../config";
const open = require("open");
const proxyquire = require("proxyquire");

describe("extensionController", function() {
  let context: vscode.ExtensionContext;
  let extensionController: ExtensionController;
  let extensionControllerAny: any;

  before(function() {
    context = {
      subscriptions: [],
      workspaceState: {
        get: () => {},
        update: () => Promise.resolve()
      },
      globalState: {
        get: () => {},
        update: () => Promise.resolve()
      },
      extensionPath: "",
      storagePath: "",
      globalStoragePath: "",
      logPath: "",
      asAbsolutePath: (relativePath: string) => relativePath
    };
    extensionController = new ExtensionController(context);
  });

  beforeEach(function() {
    extensionControllerAny = extensionController as any;
  });

  afterEach(function() {
    sinon.restore();
  });
  describe("showQuickPick", function() {
    it("should function exist", function() {
      const actual = typeof extensionController.showQuickPick;
      const expected = "function";
      assert.equal(actual, expected);
    });

    it("should load data and show quickPick", async function() {
      const showStub = sinon.stub(extensionControllerAny.quickPick, "show");
      const loadQuickPickDataStub = sinon.stub(
        extensionControllerAny,
        "loadQuickPickData"
      );
      // .returns(Promise.resolve());
      // sinon.stub(extensionControllerAny, "quickPick").value({
      //   show: showSpy
      // });

      await extensionControllerAny.showQuickPick();

      assert.equal(showStub.calledOnce, true);
      assert.equal(loadQuickPickDataStub.calledOnce, true);
    });
  });

  describe("clearCache", function() {
    it("should function exist", function() {
      const actual = typeof extensionController.clearCache;
      const expected = "function";
      assert.equal(actual, expected);
    });

    it("should invoke cache clearing function on cache object", async function() {
      const stub = sinon.stub(extensionControllerAny.cache, "clearCache");
      // sinon.stub(extensionControllerAny, "cache").value({
      //   clearCache: spy
      // });

      await extensionControllerAny.clearCache();

      assert.equal(stub.calledOnce, true);
    });
  });

  describe("onQuickPickSubmit", function() {
    it("should function exist", function() {
      const actual = typeof extensionControllerAny.onQuickPickSubmit;
      const expected = "function";
      assert.equal(actual, expected);
    });

    it("should invoke openInBrowser function with search url if value is string", async function() {
      const openInBrowserStub = sinon
        .stub(extensionControllerAny, "openInBrowser")
        .returns(Promise.resolve());
      sinon
        .stub(config, "searchUrl")
        .value("https://developer.mozilla.org/search");
      const text = "test search text";

      await extensionControllerAny.onQuickPickSubmit(text);
      const actual = openInBrowserStub.withArgs(
        "https://developer.mozilla.org/search?q=test+search+text"
      ).calledOnce;
      const expected = true;

      assert.equal(actual, expected);
    });

    it("should do nothing if value is string but higherLevelData array is not empty", async function() {
      const openInBrowserStub = sinon
        .stub(extensionControllerAny, "openInBrowser")
        .returns(Promise.resolve());
      sinon
        .stub(config, "searchUrl")
        .value("https://developer.mozilla.org/search");
      sinon.stub(extensionControllerAny, "higherLevelData").value([1]);
      const text = "test search text";

      await extensionControllerAny.onQuickPickSubmit(text);
      const actual = openInBrowserStub.calledOnce;
      const expected = false;

      assert.equal(actual, expected);
    });

    it("should invoke openInBrowser function with item url if value is QuickPickExtendedItem with ItemType.File", async function() {
      const openInBrowserStub = sinon
        .stub(extensionControllerAny, "openInBrowser")
        .returns(Promise.resolve());

      const qpItem: QuickPickExtendedItem = {
        label: "api test-label sub-label 3",
        url: "http://test.com",
        type: ItemType.File,
        breadcrumbs: ["api", "test-label", "sub-label 3"]
      };

      await extensionControllerAny.onQuickPickSubmit(qpItem);
      const actual = openInBrowserStub.withArgs("http://test.com").calledOnce;
      const expected = true;

      assert.equal(actual, expected);
    });

    it("should invoke loadQuickPickData function with item url if value is QuickPickExtendedItem with ItemType.Directory", async function() {
      const loadQuickPickDataStub = sinon
        .stub(extensionControllerAny, "loadQuickPickData")
        .returns(Promise.resolve());

      const qpItem: QuickPickExtendedItem = {
        label: "api test-label sub-label 3",
        url: "#",
        type: ItemType.Directory,
        breadcrumbs: ["api", "test-label", "sub-label 3"]
      };

      await extensionControllerAny.onQuickPickSubmit(qpItem);
      const actual = loadQuickPickDataStub.withArgs(qpItem).calledOnce;
      const expected = true;

      assert.equal(actual, expected);
    });

    it("should catch error and invoke vscode.window.showErrorMessage", async function() {
      const showErrorMessageStub = sinon.stub(
        vscode.window,
        "showErrorMessage"
      );

      const errorText = "test search text";

      sinon.stub(utils, "getSearchUrl").throws("test error message");

      await extensionControllerAny.onQuickPickSubmit("test search text");

      const actual = showErrorMessageStub.calledOnce;
      const expected = true;
      assert.equal(actual, expected);
    });
  });

  describe("getFlatFilesData", function() {
    it("should function exist", function() {
      const actual = typeof extensionControllerAny.getFlatFilesData;
      const expected = "function";
      assert.equal(actual, expected);
    });

    it("should invoke downloadFlatFilesData function", async function() {
      const stub = sinon
        .stub(extensionControllerAny, "downloadFlatFilesData")
        .returns(Promise.resolve());
      const progress: any = { report: sinon.stub() };

      await extensionControllerAny.getFlatFilesData(progress);

      const actual = stub.calledOnce;
      const expected = true;
      assert.equal(actual, expected);
    });
  });

  describe("cacheFlatFilesWithProgressTask", function() {
    it("should function exist", function() {
      const actual = typeof extensionControllerAny.cacheFlatFilesWithProgressTask;
      const expected = "function";
      assert.equal(actual, expected);
    });

    it("should invoke cacheFlatFilesData function", async function() {
      const stub = sinon
        .stub(extensionControllerAny, "cacheFlatFilesData")
        .returns(Promise.resolve());
      const progress: any = { report: sinon.stub() };

      await extensionControllerAny.cacheFlatFilesWithProgressTask(progress);

      const actual = stub.calledOnce;
      const expected = true;
      assert.equal(actual, expected);
    });
  });

  describe("cacheFlatFilesWithProgress", function() {
    it("should function exist", function() {
      const actual = typeof extensionControllerAny.cacheFlatFilesWithProgress;
      const expected = "function";
      assert.equal(actual, expected);
    });

    it("should download and cache data if cache returns undefined", async function() {
      const stub = sinon
        .stub(vscode.window, "withProgress")
        .returns(Promise.resolve());

      sinon.stub(utils, "shouldDisplayFlatList").returns(true);

      sinon.stub(utils, "getToken").returns("sample token");

      sinon
        .stub(extensionControllerAny.cache, "getFlatFilesFromCache")
        .returns(undefined);

      sinon
        .stub(extensionControllerAny, "cacheFlatFilesData")
        .returns(Promise.resolve());

      await extensionControllerAny.cacheFlatFilesWithProgress();

      const actual = stub.calledOnce;
      const expected = true;
      assert.equal(actual, expected);
    });

    it("should do nothing if data is in cache", async function() {
      const stub = sinon
        .stub(vscode.window, "withProgress")
        .returns(Promise.resolve());

      const data: Item[] = [
        {
          name: "sub-label",
          url: "#",
          type: ItemType.File,
          breadcrumbs: ["api", "test-label", "sub-label"]
        },
        {
          name: "sub-label 2",
          url: "https://sub-label-2.com",
          type: ItemType.File,
          breadcrumbs: ["api", "test-label", "sub-label 2"]
        }
      ];

      sinon
        .stub(extensionControllerAny.cache, "getFlatFilesFromCache")
        .returns(data);

      await extensionControllerAny.cacheFlatFilesWithProgress();

      const actual = stub.called;
      const expected = false;
      assert.equal(actual, expected);
    });
  });

  describe("cacheFlatFilesData", function() {
    it("should function exist", function() {
      const actual = typeof extensionControllerAny.cacheFlatFilesData;
      const expected = "function";
      assert.equal(actual, expected);
    });

    it("should invoke getFlatFilesData function", async function() {
      const stub = sinon
        .stub(extensionControllerAny, "getFlatFilesData")
        .returns(Promise.resolve());
      const progress: any = {};

      await extensionControllerAny.cacheFlatFilesData(progress);

      const actual = stub.calledOnce;
      const expected = true;
      assert.equal(actual, expected);
    });
  });

  describe("isHigherLevelDataEmpty", function() {
    it("should function exist", function() {
      const actual = typeof extensionControllerAny.isHigherLevelDataEmpty;
      const expected = "function";
      assert.equal(actual, expected);
    });

    it("should check if higherLevelData array is empty", function() {
      const stub = sinon
        .stub(extensionControllerAny, "higherLevelData")
        .value([1]);

      const actual = extensionControllerAny.isHigherLevelDataEmpty();
      const expected = false;
      assert.equal(actual, expected);
    });
  });

  describe("loadQuickPickData", function() {
    it("should function exist", function() {
      const actual = typeof extensionControllerAny.loadQuickPickData;
      const expected = "function";
      assert.equal(actual, expected);
    });

    it("should load flat list of items", async function() {
      sinon.stub(utils, "shouldDisplayFlatList").returns(true);

      const data: QuickPickExtendedItem[] = [
        {
          label: `$(link) sub-label`,
          url: "#",
          type: ItemType.File,
          parent: undefined,
          rootParent: undefined,
          breadcrumbs: ["api", "test-label", "sub-label"],
          description: "api test-label sub-label"
        },
        {
          label: `$(link) sub-label 2`,
          url: "https://sub-label-2.com",
          type: ItemType.File,
          parent: undefined,
          rootParent: undefined,
          breadcrumbs: ["api", "test-label", "sub-label 2"],
          description: "api test-label sub-label 2"
        }
      ];

      sinon
        .stub(extensionControllerAny, "getFlatQuickPickData")
        .returns(Promise.resolve(data));

      await extensionControllerAny.loadQuickPickData();

      const actual = extensionControllerAny.quickPick.quickPick.items;
      const expected = data;

      assert.deepEqual(actual, expected);
    });

    it("should load list of items", async function() {
      sinon.stub(utils, "shouldDisplayFlatList").returns(false);

      const qpItem: QuickPickExtendedItem = {
        label: "api test-label sub-label 3",
        url: "#",
        type: ItemType.Directory,
        breadcrumbs: ["api", "test-label", "sub-label 3"]
      };

      const data: QuickPickExtendedItem[] = [
        {
          label: `$(file-directory) sub-label`,
          url: "#",
          type: ItemType.File,
          parent: undefined,
          rootParent: undefined,
          breadcrumbs: ["api", "test-label", "sub-label"],
          description: "api test-label sub-label"
        },
        {
          label: `$(file-directory) sub-label 2`,
          url: "https://sub-label-2.com",
          type: ItemType.File,
          parent: undefined,
          rootParent: undefined,
          breadcrumbs: ["api", "test-label", "sub-label 2"],
          description: "api test-label sub-label 2"
        }
      ];

      sinon
        .stub(extensionControllerAny, "getQuickPickData")
        .returns(Promise.resolve(data));

      await extensionControllerAny.loadQuickPickData(qpItem);

      const actual = extensionControllerAny.quickPick.quickPick.items;
      const expected = data;

      assert.deepEqual(actual, expected);
    });

    it("should load list of root items", async function() {
      sinon.stub(utils, "shouldDisplayFlatList").returns(false);

      const data: QuickPickExtendedItem[] = [
        {
          label: `$(file-directory) sub-label`,
          url: "#",
          type: ItemType.File,
          parent: undefined,
          rootParent: undefined,
          breadcrumbs: ["api", "test-label", "sub-label"],
          description: "api test-label sub-label"
        },
        {
          label: `$(file-directory) sub-label 2`,
          url: "https://sub-label-2.com",
          type: ItemType.File,
          parent: undefined,
          rootParent: undefined,
          breadcrumbs: ["api", "test-label", "sub-label 2"],
          description: "api test-label sub-label 2"
        }
      ];

      sinon
        .stub(extensionControllerAny, "getQuickPickRootData")
        .returns(Promise.resolve(data));

      await extensionControllerAny.loadQuickPickData();

      const actual = extensionControllerAny.quickPick.quickPick.items;
      const expected = data;

      assert.deepEqual(actual, expected);
    });
  });

  describe("prepareQuickPickPlaceholder", function() {
    it("should function exist", function() {
      const actual = typeof extensionControllerAny.prepareQuickPickPlaceholder;
      const expected = "function";
      assert.equal(actual, expected);
    });

    it("should invoke clearQuickPickPlaceholder if higherLevelData is not empty", function() {
      sinon.stub(extensionControllerAny, "higherLevelData").value([1]);
      const spy = sinon.stub(
        extensionControllerAny,
        "clearQuickPickPlaceholder"
      );

      extensionControllerAny.prepareQuickPickPlaceholder();

      const actual = spy.calledOnce;
      const expected = true;
      assert.equal(actual, expected);
    });

    it("should invoke setQuickPickPlaceholder if higherLevelData is empty", function() {
      sinon.stub(extensionControllerAny, "higherLevelData").value([]);
      const spy = sinon.stub(extensionControllerAny, "setQuickPickPlaceholder");

      extensionControllerAny.prepareQuickPickPlaceholder();

      const actual = spy.calledOnce;
      const expected = true;
      assert.equal(actual, expected);
    });
  });

  describe("getFlatQuickPickData", function() {
    it("should function exist", function() {
      const actual = typeof extensionControllerAny.getFlatQuickPickData;
      const expected = "function";
      assert.equal(actual, expected);
    });

    it("should return flat quick pick data from cache", async function() {
      sinon.stub(utils, "shouldDisplayFlatList").returns(true);

      const data: Item[] = [
        {
          name: "sub-label",
          url: "#",
          type: ItemType.File,
          breadcrumbs: ["api", "test-label", "sub-label"]
        },
        {
          name: "sub-label 2",
          url: "https://sub-label-2.com",
          type: ItemType.File,
          breadcrumbs: ["api", "test-label", "sub-label 2"]
        }
      ];

      sinon
        .stub(extensionControllerAny.cache, "getFlatFilesFromCache")
        .returns(data);

      const actual = await extensionControllerAny.getFlatQuickPickData();
      const expected: QuickPickExtendedItem[] = [
        {
          label: `$(link) sub-label`,
          url: "#",
          type: ItemType.File,
          parent: undefined,
          rootParent: undefined,
          breadcrumbs: ["api", "test-label", "sub-label"],
          description: "api test-label sub-label"
        },
        {
          label: `$(link) sub-label 2`,
          url: "https://sub-label-2.com",
          type: ItemType.File,
          parent: undefined,
          rootParent: undefined,
          breadcrumbs: ["api", "test-label", "sub-label 2"],
          description: "api test-label sub-label 2"
        }
      ];

      assert.deepEqual(actual, expected);
    });

    it("should return flat quick pick data if in cache is empty array", async function() {
      sinon.stub(utils, "shouldDisplayFlatList").returns(true);

      const data: Item[] = [
        {
          name: "sub-label",
          url: "#",
          type: ItemType.File,
          breadcrumbs: ["api", "test-label", "sub-label"]
        },
        {
          name: "sub-label 2",
          url: "https://sub-label-2.com",
          type: ItemType.File,
          breadcrumbs: ["api", "test-label", "sub-label 2"]
        }
      ];

      const getFlatFilesFromCacheStub = sinon.stub(
        extensionControllerAny.cache,
        "getFlatFilesFromCache"
      );

      getFlatFilesFromCacheStub.onFirstCall().returns([]);
      getFlatFilesFromCacheStub.onSecondCall().returns(data);

      sinon
        .stub(extensionControllerAny, "cacheFlatFilesWithProgress")
        .returns(Promise.resolve());

      const actual = await extensionControllerAny.getFlatQuickPickData();
      const expected: QuickPickExtendedItem[] = [
        {
          label: `$(link) sub-label`,
          url: "#",
          type: ItemType.File,
          parent: undefined,
          rootParent: undefined,
          breadcrumbs: ["api", "test-label", "sub-label"],
          description: "api test-label sub-label"
        },
        {
          label: `$(link) sub-label 2`,
          url: "https://sub-label-2.com",
          type: ItemType.File,
          parent: undefined,
          rootParent: undefined,
          breadcrumbs: ["api", "test-label", "sub-label 2"],
          description: "api test-label sub-label 2"
        }
      ];

      assert.deepEqual(actual, expected);
    });

    it("should return flat quick pick data if in cache is undefined", async function() {
      sinon.stub(utils, "shouldDisplayFlatList").returns(true);

      const data: Item[] = [
        {
          name: "sub-label",
          url: "#",
          type: ItemType.File,
          breadcrumbs: ["api", "test-label", "sub-label"]
        },
        {
          name: "sub-label 2",
          url: "https://sub-label-2.com",
          type: ItemType.File,
          breadcrumbs: ["api", "test-label", "sub-label 2"]
        }
      ];

      const getFlatFilesFromCacheStub = sinon.stub(
        extensionControllerAny.cache,
        "getFlatFilesFromCache"
      );

      getFlatFilesFromCacheStub.returns(undefined);

      sinon
        .stub(extensionControllerAny, "cacheFlatFilesWithProgress")
        .returns(Promise.resolve());

      const actual = await extensionControllerAny.getFlatQuickPickData();
      const expected: QuickPickExtendedItem[] = [];

      assert.deepEqual(actual, expected);
    });
  });

  describe("getQuickPickRootData", function() {
    it("should function exist", function() {
      const actual = typeof extensionControllerAny.getQuickPickRootData;
      const expected = "function";
      assert.equal(actual, expected);
    });

    it("should return tree root data", async function() {
      const data: QuickPickExtendedItem[] = [
        {
          label: `$(file-directory) category`,
          url: "",
          type: ItemType.Directory,
          parent: undefined,
          rootParent: undefined,
          breadcrumbs: ["category"],
          description: ""
        },
        {
          label: `$(file-directory) api`,
          url: "",
          type: ItemType.Directory,
          parent: undefined,
          rootParent: undefined,
          breadcrumbs: ["api"],
          description: "api"
        }
      ];

      sinon
        .stub(extensionControllerAny, "getTreeData")
        .returns(Promise.resolve(data));

      const actual = await extensionControllerAny.getQuickPickRootData();
      const expected = data;

      assert.deepEqual(actual, expected);
    });
  });

  describe("getQuickPickData", function() {
    it("should function exist", function() {
      const actual = typeof extensionControllerAny.getQuickPickData;
      const expected = "function";
      assert.equal(actual, expected);
    });

    it("should return higher level data", async function() {
      sinon.stub(config, "higherLevelLabel").value("..");

      const backwardNavigationQpItem: QuickPickExtendedItem = {
        label: `$(file-directory) ${config.higherLevelLabel}`,
        description: "",
        type: ItemType.Directory,
        url: "#",
        breadcrumbs: []
      };
      const data: QuickPickExtendedItem[] = [
        {
          label: `$(file-directory) sub-label`,
          url: "",
          type: ItemType.File,
          parent: undefined,
          rootParent: undefined,
          breadcrumbs: ["api", "test-label", "sub-label"],
          description: "api test-label sub-label"
        },
        {
          label: `$(file-directory) sub-label 2`,
          url: "https://sub-label-2.com",
          type: ItemType.Directory,
          parent: undefined,
          rootParent: undefined,
          breadcrumbs: ["api", "test-label", "sub-label 2"],
          description: "api test-label sub-label 2"
        }
      ];
      const higherLevelData: QuickPickExtendedItem[][] = [data];

      sinon
        .stub(extensionControllerAny, "higherLevelData")
        .value(higherLevelData);

      const actual = await extensionControllerAny.getQuickPickData(
        backwardNavigationQpItem
      );
      const expected: QuickPickExtendedItem[] = data;

      assert.deepEqual(actual, expected);
    });

    it("should return lower level data", async function() {
      const qpItem: QuickPickExtendedItem = {
        label: "api test-label sub-label 3",
        url: "#",
        type: ItemType.Directory,
        breadcrumbs: ["api", "test-label", "sub-label 3"]
      };
      const data: QuickPickExtendedItem[] = [
        {
          label: `$(file-directory) sub-label`,
          url: "#",
          type: ItemType.File,
          parent: undefined,
          rootParent: undefined,
          breadcrumbs: ["api", "test-label", "sub-label"],
          description: "api test-label sub-label"
        },
        {
          label: `$(file-directory) sub-label 2`,
          url: "https://sub-label-2.com",
          type: ItemType.Directory,
          parent: undefined,
          rootParent: undefined,
          breadcrumbs: ["api", "test-label", "sub-label 2"],
          description: "api test-label sub-label 2"
        }
      ];

      sinon
        .stub(extensionControllerAny, "getLowerLevelQpData")
        .returns(Promise.resolve(data));

      const actual = await extensionControllerAny.getQuickPickData(qpItem);
      const expected: QuickPickExtendedItem[] = data;

      assert.deepEqual(actual, expected);
    });
  });

  describe("rememberHigherLevelQpData", function() {
    it("should function exist", function() {
      const actual = typeof extensionControllerAny.rememberHigherLevelQpData;
      const expected = "function";
      assert.equal(actual, expected);
    });

    it("should remember higher level data", function() {
      const higherLevelData: QuickPickExtendedItem[][] = [];
      const data: QuickPickExtendedItem[] = [
        {
          label: `$(file-directory) sub-label`,
          url: "#",
          type: ItemType.File,
          parent: undefined,
          rootParent: undefined,
          breadcrumbs: ["api", "test-label", "sub-label"],
          description: "api test-label sub-label"
        },
        {
          label: `$(file-directory) sub-label 2`,
          url: "https://sub-label-2.com",
          type: ItemType.Directory,
          parent: undefined,
          rootParent: undefined,
          breadcrumbs: ["api", "test-label", "sub-label 2"],
          description: "api test-label sub-label 2"
        }
      ];

      sinon
        .stub(extensionControllerAny, "higherLevelData")
        .value(higherLevelData);

      sinon.stub(extensionControllerAny.quickPick, "getItems").returns(data);

      extensionControllerAny.rememberHigherLevelQpData();
      const actual = higherLevelData;
      const expected: QuickPickExtendedItem[][] = [data];

      assert.deepEqual(actual, expected);
    });
  });

  describe("getHigherLevelQpData", function() {
    it("should function exist", function() {
      const actual = typeof extensionControllerAny.getHigherLevelQpData;
      const expected = "function";
      assert.equal(actual, expected);
    });

    it("should return higher level data", function() {
      const higherLevelData: QuickPickExtendedItem[] = [
        {
          label: `$(file-directory) sub-label`,
          url: "#",
          type: ItemType.File,
          parent: undefined,
          rootParent: undefined,
          breadcrumbs: ["api", "test-label", "sub-label"],
          description: "api test-label sub-label"
        },
        {
          label: `$(file-directory) sub-label 2`,
          url: "https://sub-label-2.com",
          type: ItemType.Directory,
          parent: undefined,
          rootParent: undefined,
          breadcrumbs: ["api", "test-label", "sub-label 2"],
          description: "api test-label sub-label 2"
        }
      ];

      sinon
        .stub(extensionControllerAny, "higherLevelData")
        .value([higherLevelData]);

      const actual = extensionControllerAny.getHigherLevelQpData();
      const expected: QuickPickExtendedItem[] = higherLevelData;

      assert.deepEqual(actual, expected);
    });
  });

  describe("getLowerLevelQpData", function() {
    it("should function exist", function() {
      const actual = typeof extensionControllerAny.getLowerLevelQpData;
      const expected = "function";
      assert.equal(actual, expected);
    });

    it("should return lower level data without empty urls", async function() {
      const qpItem: QuickPickExtendedItem = {
        label: "api test-label sub-label 3",
        url: "#",
        type: ItemType.Directory,
        breadcrumbs: ["api", "test-label", "sub-label 3"]
      };

      const lowerLevelData: QuickPickExtendedItem[] = [
        {
          label: `$(file-directory) sub-label`,
          url: "",
          type: ItemType.File,
          parent: undefined,
          rootParent: undefined,
          breadcrumbs: ["api", "test-label", "sub-label"],
          description: "api test-label sub-label"
        },
        {
          label: `$(file-directory) sub-label 2`,
          url: "https://sub-label-2.com",
          type: ItemType.Directory,
          parent: undefined,
          rootParent: undefined,
          breadcrumbs: ["api", "test-label", "sub-label 2"],
          description: "api test-label sub-label 2"
        }
      ];

      sinon
        .stub(extensionControllerAny, "getTreeData")
        .returns(Promise.resolve(lowerLevelData));

      const actual = await extensionControllerAny.getLowerLevelQpData(qpItem);
      const expected: QuickPickExtendedItem[] = [
        {
          label: `$(file-directory) sub-label 2`,
          url: "https://sub-label-2.com",
          type: ItemType.Directory,
          parent: undefined,
          rootParent: undefined,
          breadcrumbs: ["api", "test-label", "sub-label 2"],
          description: "api test-label sub-label 2"
        }
      ];

      assert.deepEqual(actual, expected);
    });
  });

  describe("setQuickPickPlaceholder", function() {
    it("should function exist", function() {
      const actual = typeof extensionControllerAny.setQuickPickPlaceholder;
      const expected = "function";
      assert.equal(actual, expected);
    });

    it("should invoke quickPick.setPlaceholder function", async function() {
      const spy = sinon.stub(
        extensionControllerAny.quickPick,
        "setPlaceholder"
      );

      const text = "choose item from the list or type anything to search";
      extensionControllerAny.setQuickPickPlaceholder();
      const actual = spy.withArgs(text).calledOnce;
      const expected = true;

      assert.equal(actual, expected);
    });
  });

  describe("clearQuickPickPlaceholder", function() {
    it("should function exist", function() {
      const actual = typeof extensionControllerAny.clearQuickPickPlaceholder;
      const expected = "function";
      assert.equal(actual, expected);
    });

    it("should invoke quickPick.setPlaceholder function with undefined parameter", async function() {
      const spy = sinon.stub(
        extensionControllerAny.quickPick,
        "setPlaceholder"
      );

      extensionControllerAny.clearQuickPickPlaceholder();
      const actual = spy.withArgs(undefined).calledOnce;
      const expected = true;

      assert.equal(actual, expected);
    });
  });

  describe("getTreeData", function() {
    let items: Item[];
    let qpItems: QuickPickExtendedItem[];

    before(function() {
      items = [
        {
          name: "sub-label",
          url: "#",
          type: ItemType.File,
          breadcrumbs: ["api", "test-label", "sub-label"]
        },
        {
          name: "sub-label 2",
          url: "https://sub-label-2.com",
          type: ItemType.Directory,
          breadcrumbs: ["api", "test-label", "sub-label 2"]
        }
      ];

      qpItems = [
        {
          label: `$(file-directory) sub-label`,
          url: "",
          type: ItemType.File,
          parent: undefined,
          rootParent: undefined,
          breadcrumbs: ["api", "test-label", "sub-label"],
          description: "api test-label sub-label"
        },
        {
          label: `$(file-directory) sub-label 2`,
          url: "https://sub-label-2.com",
          type: ItemType.Directory,
          parent: undefined,
          rootParent: undefined,
          breadcrumbs: ["api", "test-label", "sub-label 2"],
          description: "api test-label sub-label 2"
        }
      ];
    });

    it("should function exist", function() {
      const actual = typeof extensionControllerAny.getTreeData;
      const expected = "function";
      assert.equal(actual, expected);
    });

    it("should return quick pick tree data if data is in cache", async function() {
      sinon
        .stub(extensionControllerAny.cache, "getTreeItemsByUrlFromCache")
        .returns(items);
      sinon.stub(utils, "prepareQpData").returns(qpItems);

      const actual = await extensionControllerAny.getTreeData();
      const expected = qpItems;
      assert.deepEqual(actual, expected);
    });

    it("should return quick pick tree data if data is not in cache and parent item is not provided", async function() {
      sinon
        .stub(extensionControllerAny.cache, "getTreeItemsByUrlFromCache")
        .returns([]);
      sinon.stub(extensionControllerAny, "downloadTreeData").returns(items);
      sinon.stub(utils, "prepareQpData").returns(qpItems);

      const actual = await extensionControllerAny.getTreeData();
      const expected = qpItems;
      assert.deepEqual(actual, expected);
    });

    it("should return quick pick tree data if data is not in cache and parent item is provided", async function() {
      const qpItem: QuickPickExtendedItem = {
        label: "api test-label sub-label 3",
        url: "#",
        type: ItemType.Directory,
        breadcrumbs: ["api", "test-label", "sub-label 3"]
      };

      sinon
        .stub(extensionControllerAny.cache, "getTreeItemsByUrlFromCache")
        .returns([]);
      sinon.stub(extensionControllerAny, "downloadTreeData").returns(items);
      sinon.stub(utils, "prepareQpData").returns(qpItems);

      const actual = await extensionControllerAny.getTreeData(qpItem);
      const expected = qpItems;
      assert.deepEqual(actual, expected);
    });
  });

  describe("downloadTreeData", function() {
    it("should function exist", function() {
      const actual = typeof extensionControllerAny.downloadTreeData;
      const expected = "function";
      assert.equal(actual, expected);
    });

    it("should return tree node data", async function() {
      const data: Item[] = [
        {
          name: "label",
          url:
            "https://api.github.com/repos/mdn/browser-compat-data/contents/label?ref=master",
          type: ItemType.Directory,
          breadcrumbs: ["label"]
        },
        {
          name: "category",
          url:
            "https://api.github.com/repos/mdn/browser-compat-data/contents/category?ref=master",
          type: ItemType.Directory,
          breadcrumbs: ["category"]
        }
      ];

      sinon
        .stub(extensionControllerAny.dataService, "downloadTreeData")
        .returns(Promise.resolve(data));

      const updateCacheStub = sinon.stub(
        extensionControllerAny.cache,
        "updateTreeItemsByUrlFromCache"
      );

      const actualData = await extensionControllerAny.downloadTreeData();
      const expectedData = data;
      const actualUpdateCacheCalled = updateCacheStub.calledOnce;
      const expectedUpdateCacheCalled = true;

      assert.equal(actualData, expectedData);
      assert.equal(actualUpdateCacheCalled, expectedUpdateCacheCalled);
    });
  });

  describe("downloadFlatFilesData", function() {
    it("should function exist", function() {
      const actual = typeof extensionControllerAny.downloadFlatFilesData;
      const expected = "function";
      assert.equal(actual, expected);
    });

    it("should return flat data", async function() {
      const data: Item[] = [
        {
          name: "label",
          url:
            "https://api.github.com/repos/mdn/browser-compat-data/contents/label?ref=master",
          type: ItemType.Directory,
          breadcrumbs: ["label"]
        },
        {
          name: "category",
          url:
            "https://api.github.com/repos/mdn/browser-compat-data/contents/category?ref=master",
          type: ItemType.Directory,
          breadcrumbs: ["category"]
        }
      ];
      sinon
        .stub(extensionControllerAny.dataService, "downloadFlatData")
        .returns(Promise.resolve(data));

      const updateCacheStub = sinon.stub(
        extensionControllerAny.cache,
        "updateFlatFilesListCache"
      );

      const actualData = await extensionControllerAny.downloadFlatFilesData();
      const expectedData = data;
      const actualUpdateCacheCalled = updateCacheStub.calledOnce;
      const expectedUpdateCacheCalled = true;

      assert.equal(actualData, expectedData);
      assert.equal(actualUpdateCacheCalled, expectedUpdateCacheCalled);
    });
  });

  describe("openInBrowser", function() {
    it("should function exist", function() {
      const actual = typeof extensionControllerAny.openInBrowser;
      const expected = "function";
      assert.equal(actual, expected);
    });

    it("should invoke open function", async function() {
      const openStub = sinon.stub().returns(Promise.resolve());
      const ProxiedExtensionController = proxyquire(
        "../../ExtensionController",
        {
          open: openStub
        }
      ).default;

      extensionControllerAny = new ProxiedExtensionController(context);

      await extensionControllerAny.openInBrowser("http://test.com");

      const actual = openStub.withArgs("http://test.com").calledOnce;
      const expected = true;

      assert.equal(actual, expected);
    });
  });
});
