import request from '@/utils/request'
import { getToken } from '@/utils/auth'

export async function uploadAaProgram(file) {
  if (!(file instanceof File)) {
    throw new Error('Invalid file type')
  }

  const formData = new FormData()
  formData.append('file', file)

  try {
    return await request({
      url: '/aa/program/upload',
      method: 'post',
      data: formData,
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        // 处理上传进度
        console.log(`Uploaded ${progressEvent.loaded} bytes out of ${progressEvent.total}`)
      }
    })
  } catch (error) {
    console.error('Upload failed:', error)
    throw error
  }
}

export function uploadFile(file) {
  const formData = new FormData()
  formData.append('file', file)

  request({
    url: '/aa/program/upload', // 调用后端上传接口
    method: 'post',
    headers: {
      'Content-Type': 'multipart/form-data' // 设置内容类型为 multipart/form-data
    },
    data: formData
  })
    .then(response => {
      // 处理上传成功的响应
      console.log('文件上传成功: ' + response)
    })
    .catch(error => {
      // 处理上传失败的响应
      console.log('文件上传失败: ' + error.message)
    })
}

export function listAaProgramInfo(query) {
  return request({
    url: '/aa/program/search',
    method: 'get',
    params: query
  })
}

export function deleteAaProgram(fileName, id) {
  return request({
    url: '/aa/program/delete',
    method: 'delete',
    params: { fileName: fileName, id: id }
  })
}

export function downloadAaProgramByGetUrl(fileName) {
  return request({
    url: '/aa/program/download/getUrl',
    method: 'get',
    params: { fileName: fileName },
  })
}

export function uploadAaProgramByPutUrl(fileName) {
  return request({
    url: '/aa/program/upload/putUrl',
    method: 'get',
    params: { fileName: fileName },
  });
}

export function addAaProgramInfo(data) {
  return request({
    url: '/aa/program/add',
    method: 'post',
    data: data
  })
}

export function editAaProgramInfo(data) {
  return request({
    url: '/aa/program/edit',
    method: 'post',
    data: data
  })
}

export function isExistAaProgram(fileName) {
  return request({
    url: '/aa/program/isExist',
    method: 'get',
    params: { fileName: fileName }
  })
}
