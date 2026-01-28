import WebsitePageClient from "./page.client";

const WebsitePage = () => {
    const ipServer = process.env.IP_SERVER;
    return <WebsitePageClient ipServer={ipServer} />;
}
export default WebsitePage;