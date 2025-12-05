import { ApiBuilder } from "./types";

export const googleClassroomEndpoints = (builder: ApiBuilder) => ({
  connectGoogleClassroom: builder.mutation<void, void>({
    query: () => ({
      url: "v1/integrations/lms/google-classroom/connect",
      method: "GET",
    }),
  }),
});
