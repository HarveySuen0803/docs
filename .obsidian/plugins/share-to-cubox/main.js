"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const obsidian_1 = require("obsidian");
const DEFAULT_SETTINGS = {
    apiKey: "",
    defaultTags: "Obsidian",
    defaultFolder: "",
};
const translations = {
    en: {
        shareToCubox: "Share to Cubox",
        noActiveFile: "No active file to share.",
        enterApiKey: "Please enter your Cubox API key in the plugin settings.",
        setting: "Share to Cubox Settings",
        settings: {
            apiKey: "Cubox API Key",
            defaultTags: "Default Tags (comma-separated)",
            defaultFolder: "Default Folder",
        },
        settingDescriptions: {
            apiKey: "Enter your Cubox API Key (found in the API settings on the Cubox website)",
            defaultTags: "Enter your default tags separated by commas (e.g., tag1, tag2, tag3)",
            defaultFolder: "Enter your default folder name",
        },
        settingPlaceHolders: {
            apiKey: "Enter your Cubox API Key",
            defaultTags: "Enter your default tags here",
            defaultFolder: "Enter your default folder name here",
        },
        success: "Successfully shared to Cubox.",
        failure: "Failed to share to Cubox:",
    },
    zh: {
        shareToCubox: "分享到 Cubox",
        noActiveFile: "没有要分享的活动文件。",
        enterApiKey: "请在插件设置中输入您的 Cubox API 密钥。",
        setting: "Share to Cubox 设置",
        settings: {
            apiKey: "Cubox API 密钥",
            defaultTags: "默认标签",
            defaultFolder: "默认文件夹",
        },
        settingDescriptions: {
            apiKey: "输入您的 Cubox API 密钥（在 Cubox 网站的 API 设置中）",
            defaultTags: "输入您的默认标签，用逗号分隔（例如，tag1，tag2，tag3）",
            defaultFolder: "输入您的默认文件夹名称",
        },
        settingPlaceHolders: {
            apiKey: "输入您的 Cubox API 密钥",
            defaultTags: "在此输入您的默认标签",
            defaultFolder: "在此输入您的默认文件夹名称",
        },
        success: "成功分享到 Cubox。",
        failure: "分享到 Cubox 失败：",
    },
};
class CuboxApi {
    constructor(apiKey) {
        this.apiKey = apiKey;
    }
    saveMemo(params) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (params.tags === undefined) {
                    delete params.tags;
                }
                if (params.folder === undefined) {
                    delete params.folder;
                }
                const response = yield (0, obsidian_1.requestUrl)({
                    url: `https://cubox.pro/c/api/save/${this.apiKey}`,
                    method: "POST",
                    body: JSON.stringify(params),
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                const responseBody = yield response.json;
                if (responseBody.code === 200) {
                    return { success: true };
                }
                else {
                    return { success: false, error: responseBody.message || "Unknown error" };
                }
            }
            catch (error) {
                return { success: false, error: error.message };
            }
        });
    }
}
class CuboxPlugin extends obsidian_1.Plugin {
    constructor(app, manifest) {
        super(app, manifest);
        this.settings = DEFAULT_SETTINGS;
        const language = obsidian_1.moment.locale();
        this.translation = translations[language.startsWith("zh") ? "zh" : "en"];
    }
    onload() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.loadSettings();
            this.addCommand({
                id: "share-this",
                name: this.translation.shareToCubox,
                callback: () => this.shareToCubox(),
            });
            this.addRibbonIcon("share", this.translation.shareToCubox, () => {
                this.shareToCubox();
            });
            this.addSettingTab(new CuboxSettingTab(this.app, this));
        });
    }
    loadSettings() {
        return __awaiter(this, void 0, void 0, function* () {
            this.settings = Object.assign({}, DEFAULT_SETTINGS, yield this.loadData());
        });
    }
    saveSettings() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.saveData(this.settings);
        });
    }
    shareToCubox() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.settings.apiKey) {
                new obsidian_1.Notice(this.translation.enterApiKey);
                return;
            }
            const activeFile = this.app.workspace.getActiveFile();
            if (!activeFile) {
                new obsidian_1.Notice(this.translation.noActiveFile);
                return;
            }
            const fileContent = yield this.app.vault.read(activeFile);
            const cuboxApi = new CuboxApi(this.settings.apiKey);
            const title = activeFile.basename;
            const description = fileContent;
            const tags = this.settings.defaultTags !== ""
                ? this.settings.defaultTags.split(",").map((tag) => tag.trim())
                : undefined;
            const folder = this.settings.defaultFolder || undefined;
            const response = yield cuboxApi.saveMemo({
                type: "memo",
                content: fileContent,
                title,
                description,
                tags,
                folder,
            });
            if (response.success) {
                new obsidian_1.Notice(this.translation.success);
            }
            else {
                new obsidian_1.Notice(this.translation.failure + response.error);
            }
        });
    }
}
exports.default = CuboxPlugin;
class CuboxSettingTab extends obsidian_1.PluginSettingTab {
    constructor(app, plugin) {
        super(app, plugin);
        this.plugin = plugin;
    }
    display() {
        let { containerEl } = this;
        containerEl.empty();
        new obsidian_1.Setting(containerEl)
            .setName(this.plugin.translation.settings.apiKey)
            .setDesc(this.plugin.translation.settingDescriptions.apiKey)
            .addText((text) => text
            .setPlaceholder(this.plugin.translation.settingPlaceHolders.apiKey)
            .setValue(this.plugin.settings.apiKey)
            .onChange((value) => __awaiter(this, void 0, void 0, function* () {
            this.plugin.settings.apiKey = value;
            yield this.plugin.saveSettings();
        })));
        new obsidian_1.Setting(containerEl)
            .setName(this.plugin.translation.settings.defaultTags)
            .setDesc(this.plugin.translation.settingDescriptions.defaultTags)
            .addText((text) => text
            .setPlaceholder(this.plugin.translation.settingPlaceHolders.defaultTags)
            .setValue(this.plugin.settings.defaultTags)
            .onChange((value) => __awaiter(this, void 0, void 0, function* () {
            this.plugin.settings.defaultTags = value;
            yield this.plugin.saveSettings();
        })));
        new obsidian_1.Setting(containerEl)
            .setName(this.plugin.translation.settings.defaultFolder)
            .setDesc(this.plugin.translation.settingDescriptions.defaultFolder)
            .addText((text) => text
            .setPlaceholder(this.plugin.translation.settingPlaceHolders.defaultFolder)
            .setValue(this.plugin.settings.defaultFolder)
            .onChange((value) => __awaiter(this, void 0, void 0, function* () {
            this.plugin.settings.defaultFolder = value;
            yield this.plugin.saveSettings();
        })));
    }
}
