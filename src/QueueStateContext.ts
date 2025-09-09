import { createContext, useState } from "react";

export type ContainerAPI = {
	useState: typeof useState;
};

const QueueStateContext = createContext<ContainerAPI | undefined>(undefined);

export default QueueStateContext;