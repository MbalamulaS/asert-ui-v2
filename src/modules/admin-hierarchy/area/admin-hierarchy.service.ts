import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpService } from 'app/api/api.service';
import { ApiResponse } from 'app/custom-response';
import { TreeNode } from 'components/tree-browser/data';
import { Observable } from 'rxjs';
import { getCurrentUser } from 'utils/helpers';

export interface AdminHierarchy {
  id: string;
  uuid: string;
  name: string;
  code: string;
  isoCode: string;
  parentId?: number;
  adminHierarchyLevelId: number;
}

const API = 'admin-hierarchies';

@Injectable({
  providedIn: 'root',
})
export class AdminHierarchyService {
  constructor(private readonly httpService: HttpService) {}

  form = new FormGroup({
    id: new FormControl(''),
    uuid: new FormControl(''),
    name: new FormControl('', [Validators.required]),
    code: new FormControl('', [Validators.required]),
    isoCode: new FormControl(null),
    adminHierarchyLevelId: new FormControl(null, [Validators.required]),
    parentId: new FormControl(''),
  });

  populateForm(data: AdminHierarchy) {
    this.form.patchValue(data);
  }

  clearForms() {
    this.clearForm();
  }

  clearForm() {
    this.form.setValue({
      id: '',
      uuid: '',
      name: '',
      code: '',
      isoCode: '',
      adminHierarchyLevelId: '',
      parentId: '',
    });
  }

  get(params?: Record<string, any>): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(API, { ...params });
  }

  create(role: any): Observable<ApiResponse> {
    return this.httpService.post<ApiResponse>(API, role);
  }

  update(uuid: string, role: any): Observable<ApiResponse> {
    return this.httpService.put<ApiResponse>(`${API}/${uuid}`, role);
  }

  delete(uuid: string): Observable<ApiResponse> {
    return this.httpService.delete<ApiResponse>(`${API}/${uuid}`);
  }

  /**
   * Retrieves the hierarchical tree structure of admin hierarchies.
   * @param params - Parameters for filtering or paginating the results.
   * @returns A Promise that resolves to the AxiosResponse for the getTree request.
   */
  getTree(params?: Record<any, any>) {
    const user = getCurrentUser();
    const locationId = user.adminHierarchyId;

    return params
      ? this.httpService.get<ApiResponse>(`${API}/user-tree`, { params })
      : this.httpService.get<ApiResponse>(
          `${API}/user-tree?parentId=${locationId}`,
        );
  }

  getCatchmentAreas(params?: Record<any, any>) {
    return this.httpService.get<ApiResponse>(
      `${API}/get-by-facility-level-id-and-shehia-id`,
      { ...params },
    );
  }

  async sanitizeChildren(results: any) {
    return results.map((r) => ({
      id: r.id,
      code: r.code,
      isoCode: r.code,
      name: r.name,
      levelId: r.levelId,
      levelName: r.levelName,
      levelCode: r.levelCode,
      children: r.children,
    }));
  }

  deepUpdateChildren(children: TreeNode[], id: number, results: any) {
    if (children) {
      return children.map((child) =>
        child.id === id
          ? { ...child, children: [...results] }
          : {
              ...child,
              children: this.deepUpdateChildren(child.children, id, results),
            },
      );
    }
  }

  getRegion() {
    return this.httpService.get<ApiResponse>(`${API}/get-districts`);
  }

  getPortalRegions() {
    return this.httpService.get<ApiResponse>(`${API}/get-portal-regions`);
  }

  getShehia(regionId: any) {
    return this.httpService.get<ApiResponse>(
      `${API}/get-shehia-by-parent/${regionId}`,
    );
  }

  searchTree(params?: Record<string, any>): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(`${API}/search-tree`, {
      ...params,
    });
  }

  getChildren(uuid: string): Observable<ApiResponse> {
    return this.httpService.get<ApiResponse>(`${API}/${uuid}/get-children`);
  }
}
