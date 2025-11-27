# Funnel Feature - Quick Start Guide

## What is the Funnel Feature?

The Funnel feature enables **multi-stage iterative image generation**. Instead of generating a single image at a time, you can:

1. **Generate in Parallel** - Run multiple workflows/models at once
2. **Select Best Results** - Choose which images to keep
3. **Refine Iteratively** - Adjust parameters and regenerate
4. **Build Pipelines** - Create multi-step refinement workflows

## How to Use

### Step 1: Access Funnels

- Navigate to `http://localhost:3001/funnels`
- Or click "Open Funnels" button on the main studio page

### Step 2: Create Your First Funnel

1. Click **"New Funnel"** button
2. Fill in the form:
    - **Name**: Give your funnel a descriptive name
    - **Description**: Optional description
    - **Select Workflows**: Choose multiple workflows to run in parallel (e.g., flux-krea-dev, sd15-basic)
    - **Base Prompt**: Your initial generation prompt
    - **Negative Prompt**: What to avoid (optional)
    - **Images per Workflow**: How many images each workflow generates (default: 1)

3. Click **"Create & Generate"**
4. Wait for mock generation to complete (~2-3 seconds per workflow)

### Step 3: Review Generated Images

- You'll see a grid of all generated images
- Each image shows:
    - The workflow that generated it
    - The seed used
    - Preview on hover with prompt details

### Step 4: Select Images

1. Click images to select/deselect them
2. Selected images have a purple border
3. Use "Select All" or "Clear" buttons for batch selection
4. Click **"Confirm Selection"** to save your choices

### Step 5: Refine (Optional)

In the right panel:

1. **Batch Edit**: Apply prompt changes to all selected images
2. **Individual Edits**:
    - Change workflow per image
    - Adjust seed values
    - Modify parameters

### Step 6: Create Next Step

1. Click **"Create Next Step"**
2. System generates new variants based on your selections
3. View results in the timeline
4. Repeat the process!

## Features

### ✨ Multi-Workflow Generation

- Run 2, 3, or more workflows simultaneously
- Compare results side-by-side
- Find the best workflow for your needs

### 🎯 Smart Selection

- Visual selection interface
- Selection counts and stats
- Checkbox-based selection

### ⚙️ Parameter Refinement

- Global prompt overrides
- Per-image workflow switching
- Seed control
- Parameter diff tracking

### 📊 Timeline Navigation

- Visual step-by-step progression
- Click any step to view its images
- Status indicators (generating, selecting, completed)
- Image counts per step

### 💾 Automatic Saving

- All funnels auto-saved to disk
- Resume anytime
- Full history preserved

## Example Workflow

**Goal**: Create the perfect product shot

1. **Step 1**: Generate with 3 workflows
    - Select: flux-krea-dev, sd15-basic, another-model
    - Prompt: "Professional product photography, studio lighting"
    - Result: 3 different interpretations

2. **Step 2**: Select best 2 images, refine
    - Select the 2 most promising results
    - Adjust prompt: Add "white background, high detail"
    - Result: 2 refined versions

3. **Step 3**: Final polish
    - Select the winner
    - Switch to high-quality workflow
    - Fine-tune seed for consistency
    - Result: Perfect final image!

## Mock vs Real Generation

**Currently**: Using mock generation

- Fast (2-3 seconds)
- SVG placeholders with metadata
- Perfect for testing the workflow

**Future**: Real ComfyUI integration

- Connect to actual ComfyUI backend
- Real image generation
- Full workflow parameter support

## File Locations

All funnel data is stored in:

```
/data/funnels/
  [funnel-id]/
    funnel.json       # Funnel config
    steps/            # Step metadata
    images/           # Image metadata
    jobs/             # Generation jobs
```

## Keyboard Shortcuts

- Click image: Toggle selection
- Timeline: Click step to navigate
- Browser back: Return to funnel list

## Tips & Tricks

1. **Start Simple**: Begin with 2-3 workflows to understand the flow
2. **Use Descriptive Names**: Name funnels by project or goal
3. **Iterate Quickly**: Don't over-refine early steps
4. **Compare Workflows**: Use funnels to A/B test different models
5. **Save Often**: Selections are auto-saved when confirmed

## Troubleshooting

**Q: No workflows showing?**

- Check that workflows are loaded in the main studio
- Refresh workflows from the studio page

**Q: Generation stuck?**

- Currently using mock generation, should complete quickly
- Check browser console for errors

**Q: Can't select images?**

- Make sure generation is complete (status: "selecting")
- Check that images loaded properly

**Q: How to delete a funnel?**

- Open the funnel
- Click "Delete Funnel" button in top right
- Confirm deletion

## Next Steps

Once you're comfortable with the funnel workflow:

1. Connect to real ComfyUI backend
2. Add ControlNet support
3. Implement image-to-image refinement
4. Export final results

## Need Help?

Check the full documentation: `FUNNEL_FEATURE_README.md`
