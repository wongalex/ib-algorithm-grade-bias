<!-- PROJECT LOGO -->
<br />
<p align="center">
  <h1 align="center">IB Algorithm Investigation</h1>

  <p align="center">
    Investigated the potential bias of an algorithm that determined grades for IB  middle school and high school students during the COVID-19 pandemic. Utilized D3.js to generate visualizations from data gathered on students' grades. Website built using Bootstrap and HTML/CSS/JavaScript.
    <br />
    <br />
    Site URL:
    <a href="https://wongalex.io">wongalex.io</a>
    <br />
    <br />
    <a href="https://www.github.com/wongalex">About Me</a>
  </p>
</p>

[![Site preview](./img/preview-image.png)](https://wongalex.io)

## Table of Contents

- [Technology Stack 🛠️](#technology-stack-)
- [File/Folder Structure ⚓](#structure-)
- [Setup And Deployment 🔧](#setup-and-deployment-)

## Technology Stack 🛠️

[D3.js](https://d3js.org/)
| [Bootstrap](https://getbootstrap.com/)
| [Fullpage Lib](https://alvarotrigo.com/fullPage/)
| [GitHub API](https://developer.github.com/v3/repos/)

## File/Folder Structure ⚓

`css/`
Styles for project.

->`css/fullpage.css`
Fullpage library CSS: https://alvarotrigo.com/fullPage/

`data/`
Datasets for project.

`img/`
Images for project. Source: KIPP University Prep website and YouTube channel

`js/`
JavaScript (D3 code) for project.

-> `js/fullpage.js`
Fullpage library JS: https://alvarotrigo.com/fullPage/

`index.html`
Home page for project


## Setup And Deployment 🔧

1. To get started, fork this repository to your GitHub account.

2. Clone the forked repo from your account using:

   ```bash
     git clone https://github.com/<your-username>/home.git
   ```

3. Open in your favorite editor and edit [src/editable-stuff/config.js](./src/editable-stuff/config.js) file.

4. Add your resume as <resume.pdf> in place of [src/editable-stuff/resume.pdf](./src/editable-stuff/)

5. Edit [title](./public/index.html#L34) and meta [description](./public/index.html#L13) in [public/index.html](./public/index.html).
6. Change URL in [package.json](./package.json) file:

   ```json
    "homepage": "https://<your-username>.github.io/home"
   ```

   Or for deployment at custom domain, refer to [create-react-app.dev](https://create-react-app.dev/docs/deployment/#step-1-add-homepage-to-packagejson)

7. After editing, run the following bash commands:

   ```bash
   npm install
   ```
   This will install all the dependencies needed to run this app. The dependencies will be stored in a folder named node_modules under the home folder.
   
   After installing the dependencies, you can first test the app before deploying it by running:
   
   ```bash
   npm start
   ```
   This will start up the app. You can access it from your favorite browser and entering for the URL:
   
   ```
   localhost:3000
   ```

8. To deploy website, first run:

   ```bash
    npm run build
   ```
   This will create a build folder under the home folder that will hold all the final assets that will be deployed. Finally, to deploy, run:
   
   ```bash
    npm run deploy
   ```

   Or for deployment at \<username>.github.io, refer to [READMEdocs/custom-deployment.md](./READMEdocs/custom-deployment.md) and [pages.js](./pages.js)

9. Congrats! Your site is up and running. To see it live, visit:

   ```https
     https://<your-username>.github.io/home
   ```

10. To change the thumbnail image:

    - Navigate to the "public" folder.  
    - There you will see "social-image.png".  
    - Delete it.   
    - Take a screenshot of your version and rename it "social-image.png" and place it there.  
    
   Next time if you make changes, repeat from step 8.

Facing issues? Feel free to contact me at alexwong@g.harvard.edu .



