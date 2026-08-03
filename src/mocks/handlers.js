import { testHandler } from "./handlers/testHandler";
import { reservationHandler } from "./handlers/reservationHandler";
import { choreHandler } from "./handlers/choreHandler";
import { notificationHandler } from "./handlers/notificationHandler";
import { memberHandler } from "./handlers/memberHandler";

export const handlers = [
  ...testHandler,
  ...reservationHandler,
  ...choreHandler,
  ...notificationHandler,
  ...memberHandler,
];
