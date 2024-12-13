import request from "@/utils/request";

export function listPercentage(query) {
  return request({
    url: "/aa/params/percentage/list",
    method: "get",
    params: query
  });
}
