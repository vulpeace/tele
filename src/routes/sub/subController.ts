// import {
//   Controller,
//   Get,
//   Path,
//   Route
// } from "tsoa";
// import { SubscriptionService } from "./subService.js";
// import { subscriptionPath } from "@/src/app.js";

// @Route(subscriptionPath)
// export class SubscriptionController extends Controller {
//   @Get("{path}")
//   public getSub(
//     @Path() path: string
//   ) {
//     this.setHeader("Content-Type", "application/yaml");
//     return new SubscriptionService().get(path);
//   }
// }
