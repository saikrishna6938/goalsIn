export const FORM_TRIGGER_TYPES: FormTriggerType[] = [
  "onChange",
  "onBlur",
  "onFocus",
  "onSubmit",
  "onReset",
  "onValidate",
  "onMount",
  "onUnmount",
  "onError",
  "onSuccess",
  "onAbort",
  "onPrefill",
  "onAutoSave",
  "onExternalChange",
  "onBeforeSubmit",
];

export type FormTriggerType =
  | "onChange"
  | "onBlur"
  | "onFocus"
  | "onSubmit"
  | "onReset"
  | "onValidate"
  | "onMount"
  | "onUnmount"
  | "onError"
  | "onSuccess"
  | "onAbort"
  | "onPrefill"
  | "onAutoSave"
  | "onExternalChange"
  | "onBeforeSubmit";

export type TriggerAction =
  | { type: "show"; targetQuestionId: string }
  | { type: "hide"; targetQuestionId: string }
  | { type: "setValue"; targetQuestionId: string; value: any }
  | { type: "clearValue"; targetQuestionId: string }
  | { type: "enable"; targetQuestionId: string }
  | { type: "disable"; targetQuestionId: string };

export interface QuestionTrigger {
  triggerType: FormTriggerType;
  condition?: (currentValue: any, formState: Record<string, any>) => boolean;
  actions: TriggerAction[];
}

export enum Condition {
  Equal = "Equal",
  Greater = "Greater",
  Less = "Less",
}
