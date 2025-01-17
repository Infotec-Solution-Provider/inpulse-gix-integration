import "./clientes";
import "./notas";
import ImportGixRawData from "./routines/ImportGixRawData";

ImportGixRawData.runRoutine({ clientes: true, notas: true });