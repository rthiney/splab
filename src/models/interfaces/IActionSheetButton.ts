export interface IActionSheetButton {
    text?: string;
    role?: string;
    icon?: string;
    cssClass?: string;
    handler?: () => boolean|void;
  }