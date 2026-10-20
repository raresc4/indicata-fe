import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SidebarNav } from './sidebar-nav';

describe('SidebarNav', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarNav],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  function render(): HTMLElement {
    const fixture = TestBed.createComponent(SidebarNav);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('renders all five nav labels', () => {
    const text = render().textContent ?? '';
    for (const label of ['Projects', 'Documents', 'Indicators', 'Export & Synthesis', 'Settings']) {
      expect(text).toContain(label);
    }
  });

  it('links the Indicators item to /dashboard', () => {
    const anchors = Array.from(render().querySelectorAll('a'));
    const indicators = anchors.find((a) => a.textContent?.includes('Indicators'));
    expect(indicators).toBeTruthy();
    expect(indicators?.getAttribute('href')).toBe('/dashboard');
  });

  it('shows the Documents badge with 24', () => {
    const buttons = Array.from(render().querySelectorAll('button'));
    const documents = buttons.find((b) => b.textContent?.includes('Documents'));
    expect(documents?.textContent).toContain('24');
  });

  it('renders placeholder items as buttons, not anchors', () => {
    const el = render();
    const anchorTexts = Array.from(el.querySelectorAll('a')).map((a) => a.textContent ?? '');
    for (const label of ['Projects', 'Documents', 'Export & Synthesis', 'Settings']) {
      expect(anchorTexts.some((t) => t.includes(label))).toBe(false);
    }
  });

  it('renders the user name, role and initials', () => {
    const text = render().textContent ?? '';
    expect(text).toContain('Prof. Radu Vasile');
    expect(text).toContain('QA Director · UPT');
    expect(text).toContain('RV');
  });

  it('exposes an accessible overflow menu button', () => {
    const menu = render().querySelector('button[aria-label="User menu"]');
    expect(menu).toBeTruthy();
  });
});
