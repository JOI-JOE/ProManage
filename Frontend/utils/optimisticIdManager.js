import { v4 as uuidv4 } from "uuid";

const OPTIMISTIC_ID_PREFIX = "Optimistic";

class OptimisticIdManager {
  constructor() {
    this.cache = new Map();
    this.idToOptimisticId = new Map();
  }

  /**
   * Tạo ID lạc quan (optimistic) khi tạo object mới.
   */
  generateOptimisticId(__typename) {
    const optimisticId = `${OPTIMISTIC_ID_PREFIX}_${__typename}_${uuidv4()}`;
    const deferred = this.createDeferred();
    this.cache.set(optimisticId, deferred);
    return optimisticId;
  }

  /**
   * Liên kết ID lạc quan với ID thực từ API.
   */
  resolveId(optimisticId, resolvedId) {
    const deferred = this.cache.get(optimisticId);
    if (deferred) {
      deferred.resolve(resolvedId);
      this.idToOptimisticId.set(resolvedId, optimisticId);
      this.cache.delete(optimisticId);
    }
  }

  /**
   * Chờ ID thực từ API nếu ID hiện tại là ID lạc quan.
   */
  async waitForId(id) {
    if (!this.isOptimisticId(id)) {
      return id;
    }
    const deferred = this.cache.get(id);
    if (deferred) {
      return deferred.promise;
    }
    throw new Error(`Optimistic ID ${id} không tồn tại.`);
  }

  /**
   * Kiểm tra xem ID có phải là ID lạc quan không.
   */
  isOptimisticId(id) {
    return id.startsWith(OPTIMISTIC_ID_PREFIX);
  }

  /**
   * Giữ ID ổn định để tránh mất trạng thái UI khi re-render.
   */
  getStableIdKey(id) {
    return this.idToOptimisticId.get(id) || id;
  }

  /**
   * Xóa cache của ID lạc quan (VD: khi thoát khỏi trang).
   */
  reset() {
    this.cache.clear();
    this.idToOptimisticId.clear();
  }

  /**
   * Tạo một Promise có thể resolve từ bên ngoài.
   */
  createDeferred() {
    let resolve, reject;
    const promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  }
}

export const optimisticIdManager = new OptimisticIdManager();
