// 핸들러 합치는 곳
import { testHandler } from "./handlers/testHandler";
import { reservationHandler } from "./handlers/reservationHandler";
import { choreHandler } from "./handlers/choreHandler";

export const handlers = [
  ...testHandler,
  ...reservationHandler,
  ...choreHandler,
];
