import { describe, expect, it, vi } from 'vitest';
import { ElementPlusPlugin } from '@/plugins/element-plus';

describe('ElementPlusPlugin', () => {
  it('registers the used Element Plus components and loading directive', () => {
    const component = vi.fn();
    const directive = vi.fn();

    expect(ElementPlusPlugin.install).toBeTypeOf('function');

    ElementPlusPlugin.install?.({
      component,
      directive,
    } as any);

    expect(component).toHaveBeenCalledWith('ElButton', expect.anything());
    expect(component).toHaveBeenCalledWith('ElTable', expect.anything());
    expect(component).toHaveBeenCalledWith('ElUpload', expect.anything());
    expect(component).not.toHaveBeenCalledWith('ElTree', expect.anything());
    expect(directive).toHaveBeenCalledWith('loading', expect.anything());
  });
});
