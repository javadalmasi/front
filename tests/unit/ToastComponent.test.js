import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import ToastComponent from '@/components/ToastComponent.vue';

describe('ToastComponent', () => {
  it('renders properly', () => {
    const wrapper = mount(ToastComponent, {
      slots: {
        default: 'Test toast message'
      }
    });
    
    expect(wrapper.text()).toContain('Test toast message');
  });

  it('emits dismissed event when dismiss button is clicked', async () => {
    const wrapper = mount(ToastComponent);
    
    // Find the dismiss button and trigger click
    const button = wrapper.find('button');
    await button.trigger('click');
    
    expect(wrapper.emitted('dismissed')).toBeTruthy();
  });
});