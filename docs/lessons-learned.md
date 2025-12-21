---
title: Lessons Learned
---

# Lessons Learned

This page documents the development journey of PortRegistry—the challenges faced, decisions made, and insights gained along the way.

## Project Evolution

### Initial Architecture: React + Vite

**The Decision:**
I started PortRegistry as a web application using React and Vite. The goal was to create a fast, modern UI for monitoring ports and managing processes.

**Why This Choice:**
- **Familiarity**: React + Vite is a well-known stack with excellent developer experience
- **Speed**: Vite's hot module replacement made development incredibly fast
- **Ecosystem**: Rich ecosystem of components and libraries

**The Reality:**
While React + Vite worked well for the UI, I quickly realized that a web app had limitations:
- No native OS integration for process management
- Requires a separate Python backend server
- Users need to open a browser to use the app

### The Tauri Consideration

**What I Learned:**
In hindsight, **Tauri** would have been a better choice for this project.

**Why Tauri Would Have Been Better:**
- **True Desktop App**: Native window, system tray, and OS integration
- **Smaller Bundle Size**: Tauri apps are significantly smaller than Electron
- **Better Security**: Rust-based backend with fine-grained permissions
- **Native Feel**: Looks and behaves like a native application

**Why I Didn't Switch:**
- The React + Vite frontend was already built and working
- The Python backend (FastAPI) was functional and well-tested
- Switching would require rewriting the backend in Rust
- The current solution works for the target use case

**Takeaway:**
> 💡 **For future desktop utilities**: Start with Tauri if you need native OS integration. The upfront learning curve pays off in better user experience and smaller bundle sizes.

## Build Automation Journey

### Python Packaging with PyInstaller

**The Challenge:**
Packaging a Python + React application into a single executable was more complex than expected.

**What I Learned:**
1. **PyInstaller Quirks**: 
   - Hidden imports need to be explicitly declared
   - Data files (like the React `dist/` folder) must be added with `--add-data`
   - Different OS platforms require different PyInstaller flags

2. **Build Scripts Are Essential**:
   - Created `build_exe.ps1` to automate the entire build process
   - Script handles: frontend build → PyInstaller → verification
   - Saves hours of manual work and reduces errors

3. **Cross-Platform Complexity**:
   - Windows: Inno Setup for installers
   - macOS: Code signing and notarization are required for distribution
   - Linux: AppImage provides the best compatibility

**Takeaway:**
> 💡 **Invest in build automation early**. A good build script pays for itself after the first few releases.

## CI/CD Evolution

### GitHub Actions Matrix Workflows

**The Problem:**
Initially, I was building releases manually on my local machine. This was:
- Time-consuming
- Error-prone
- Limited to Windows (my development OS)

**The Solution:**
Implemented GitHub Actions with matrix builds:
```yaml
strategy:
  matrix:
    os: [windows-latest, macos-latest, ubuntu-latest]
```

**What I Learned:**
1. **Matrix Builds Are Powerful**: One workflow definition builds for all platforms
2. **Artifact Management**: Each runner uploads its artifacts to the same release
3. **Release Notes Automation**: GitHub's auto-generation API creates professional release notes

**Challenges Faced:**
- **Race Conditions**: Multiple runners updating the same release simultaneously
- **Platform-Specific Tools**: Inno Setup on Windows, hdiutil on macOS, etc.
- **Secrets Management**: Code signing requires secure credential handling

**Takeaway:**
> 💡 **Automate releases from day one**. Manual releases don't scale, and CI/CD forces you to document your build process.

## Documentation Journey

### From Jekyll to VitePress

**First Attempt: Jekyll**
- **Why**: GitHub Pages has built-in Jekyll support
- **Problem**: The default themes looked dated and basic
- **Issue**: Ruby dependencies, Gemfile conflicts, theme loading errors

**Second Attempt: just-the-docs Theme**
- **Why**: Recommended as a "modern" Jekyll theme
- **Problem**: Still felt basic, required Ruby/Gem management
- **Issue**: Mermaid diagrams didn't render properly

**Final Solution: VitePress**
- **Why**: Modern, fast, integrates with existing Vite stack
- **Result**: Beautiful out-of-the-box design, dark mode, instant search
- **Benefit**: No Ruby needed, consistent with frontend tooling

**What I Learned:**
1. **First Impressions Matter**: Documentation is often the first thing users see
2. **Tooling Consistency**: Using VitePress (Vite-based) with a Vite frontend makes sense
3. **Modern Frameworks Win**: VitePress's design is objectively better than Jekyll's default themes

**Takeaway:**
> 💡 **Don't settle for "good enough" documentation**. Invest in a modern docs framework—it reflects on your project's quality.

## Key Technical Insights

### 1. FastAPI + React Integration

**What Worked Well:**
- FastAPI's automatic OpenAPI documentation
- CORS handling for local development
- WebView integration for desktop-like experience

**What Was Tricky:**
- Bundling the React `dist/` folder with PyInstaller
- Serving static files from the executable
- Handling different base paths for dev vs. production

### 2. Process Management on Windows

**Challenges:**
- Windows process trees are complex
- Killing a process doesn't always kill child processes
- Docker containers require special handling

**Solutions:**
- Used `psutil` for cross-platform process management
- Implemented recursive process tree termination
- Docker SDK for container-specific operations

### 3. Port Scanning Accuracy

**Learned:**
- OS-level port scanning is more reliable than network scanning
- Docker ports need to be queried separately from system ports
- Some ports are ephemeral and change frequently

## Retrospective: What I'd Do Differently

### If Starting Over

1. **Use Tauri**: For true desktop integration and smaller bundle size
2. **Start with VitePress**: For documentation from day one
3. **Set up CI/CD Earlier**: Automate releases before the first public release
4. **Add Telemetry**: Anonymous usage stats would help prioritize features

### What I'd Keep

1. **React + Vite**: Excellent developer experience
2. **FastAPI**: Clean, fast, well-documented Python framework
3. **GitHub Actions**: Reliable and well-integrated with GitHub
4. **Semantic Versioning**: Clear version numbering helps users understand changes

## Advice for Similar Projects

### For Desktop Utilities

- **Consider Tauri** if you need native OS integration
- **Invest in build automation** early—it saves time and reduces errors
- **Document your build process** in scripts, not just README files

### For Python + Frontend Apps

- **PyInstaller works** but has a learning curve—budget time for it
- **Test on all target platforms** early and often
- **Bundle everything** users shouldn't need to install Python or Node

### For Open Source Projects

- **Good documentation matters** more than you think
- **Automate releases** to maintain momentum
- **Changelog discipline** helps users understand what changed

## Conclusion

Building PortRegistry taught me that:
- **Architecture decisions have long-term consequences** (React+Vite vs. Tauri)
- **Automation is an investment** that pays dividends (build scripts, CI/CD)
- **First impressions matter** (documentation design)
- **Iteration is key** (Jekyll → just-the-docs → VitePress)

The project works well and serves its purpose, but if I were starting today, I'd make different choices based on these lessons.

---

*This page will be updated as the project evolves and new lessons are learned.*
