.PHONY: build

build: 
	yarn --network-timeout 100000
	NODE_ENV=production node ./node_modules/.bin/webpack
	cd dist && wget https://kenig-public.ams3.digitaloceanspaces.com/ci-artifacts/build.zip && wget https://kenig-public.ams3.digitaloceanspaces.com/ci-artifacts/libs.zip && unzip -o build.zip && unzip -o libs.zip && rm build.zip libs.zip

deploy-app: build
	./node_modules/.bin/surge ./dist galt-app.surge.sh
