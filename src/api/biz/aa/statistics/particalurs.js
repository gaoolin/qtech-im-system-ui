import request from "@/utils/request";

export function listAaParamsChkDetail(query) {
  return request({
    url: "/aa/params/particulars/list",
    method: "get",
    params: query
  });
}
